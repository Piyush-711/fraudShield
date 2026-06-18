package com.fraudshield.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fraudshield.dto.Dtos.*;
import com.fraudshield.entity.AuditLog;
import com.fraudshield.entity.Transaction;
import com.fraudshield.kafka.TransactionProducer;
import com.fraudshield.repository.AuditLogRepository;
import com.fraudshield.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepo;
    private final AuditLogRepository auditLogRepo;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    // Optional beans — only present in prod profile
    @Autowired(required = false)
    private TransactionProducer kafkaProducer;

    @Value("${fraudshield.ml.service-url:http://localhost:8000}")
    private String mlServiceUrl;


    private static final DateTimeFormatter FMT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public PagedResponse<TransactionDto> getTransactions(String status, String search, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        String statusParam = (status == null || status.isBlank() || status.equals("ALL")) ? null : status;
        String searchParam = (search == null || search.isBlank()) ? null : search;

        Page<Transaction> txPage = transactionRepo.findWithFilters(statusParam, searchParam, pageable);

        List<TransactionDto> content = txPage.getContent().stream().map(this::toDto).toList();
        return PagedResponse.<TransactionDto>builder()
            .content(content)
            .totalElements(txPage.getTotalElements())
            .totalPages(txPage.getTotalPages())
            .size(txPage.getSize())
            .number(txPage.getNumber())
            .build();
    }

    public Optional<TransactionDto> getById(String transactionId) {
        return transactionRepo.findByTransactionId(transactionId).map(this::toDtoWithAudit);
    }

    @Transactional
    public ApiResponse<TransactionDto> submitReview(String transactionId, ManualReviewReq req) {
        Optional<Transaction> opt = transactionRepo.findByTransactionId(transactionId);
        if (opt.isEmpty()) return ApiResponse.error("Transaction not found: " + transactionId);

        Transaction tx = opt.get();
        String oldStatus = tx.getTransactionStatus();

        // Resolve authenticated reviewer from JWT
        String reviewedBy = resolveReviewerEmail();

        tx.setFraudFinalDecision(req.getDecision());
        tx.setTransactionStatus(mapDecisionToStatus(req.getDecision()));
        tx.setManualReviewReason(req.getReason());
        tx.setManualReviewNotes(req.getNotes());
        tx.setReviewedAt(LocalDateTime.now());
        tx.setReviewedBy(reviewedBy);
        transactionRepo.save(tx);

        // Persist audit log entry
        AuditLog auditEntry = AuditLog.builder()
            .transactionId(transactionId)
            .actionType("MANUAL_REVIEW")
            .actorType("USER")
            .actorId(reviewedBy)
            .actorRole("ANALYST_REVIEWER")
            .oldValue(oldStatus)
            .newValue(req.getDecision())
            .changeReason(req.getReason())
            .timestamp(LocalDateTime.now())
            .build();
        auditLogRepo.save(auditEntry);

        log.info("Manual review submitted for {} → {} by {}", transactionId, req.getDecision(), reviewedBy);
        return ApiResponse.ok(toDtoWithAudit(tx));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private String resolveReviewerEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        return "system@fraudshield.com";
    }

    private String mapDecisionToStatus(String decision) {
        return switch (decision) {
            case "APPROVED" -> "APPROVED";
            case "REJECTED" -> "REJECTED";
            default -> "MANUAL_REVIEW";
        };
    }

    private TransactionDto toDto(Transaction tx) {
        return buildDto(tx, null);
    }

    private TransactionDto toDtoWithAudit(Transaction tx) {
        // Build combined audit: synthetic system events + persisted review events
        List<AuditLogDto> logs = new ArrayList<>();

        // Synthetic: CREATED event
        logs.add(AuditLogDto.builder()
            .id(0L)
            .actionType("CREATED")
            .actorType("API")
            .actorId("bank_api_v1")
            .actorRole("BANK_API")
            .oldValue(null)
            .newValue("PENDING")
            .changeReason("Transaction received from bank API")
            .timestamp(tx.getCreatedAt() != null ? tx.getCreatedAt().format(FMT) + "Z" : null)
            .build());

        // Synthetic: ML_DECISION event
        if (tx.getFraudPrediction() != null) {
            logs.add(AuditLogDto.builder()
                .id(-1L)
                .actionType("ML_DECISION")
                .actorType("SYSTEM")
                .actorId("ml_model_" + tx.getModelVersion())
                .actorRole("ML_MODEL")
                .oldValue("PENDING")
                .newValue(tx.getFraudPrediction())
                .changeReason("ML Model scored " + tx.getFraudScore() + "/100 with " + tx.getFraudConfidence() + "% confidence")
                .timestamp(tx.getCreatedAt() != null ? tx.getCreatedAt().plusNanos(87_000_000).format(FMT) + "Z" : null)
                .build());
        }

        // Persisted: manual review + any other events from DB
        List<AuditLogDto> persisted = auditLogRepo
            .findByTransactionIdOrderByTimestampAsc(tx.getTransactionId())
            .stream()
            .map(this::toAuditLogDto)
            .toList();
        logs.addAll(persisted);

        return buildDto(tx, logs);
    }

    private AuditLogDto toAuditLogDto(AuditLog log) {
        return AuditLogDto.builder()
            .id(log.getId())
            .actionType(log.getActionType())
            .actorType(log.getActorType())
            .actorId(log.getActorId())
            .actorRole(log.getActorRole())
            .oldValue(log.getOldValue())
            .newValue(log.getNewValue())
            .changeReason(log.getChangeReason())
            .timestamp(log.getTimestamp() != null ? log.getTimestamp().format(FMT) + "Z" : null)
            .build();
    }

    private TransactionDto buildDto(Transaction tx, List<AuditLogDto> audit) {
        return TransactionDto.builder()
            .id(tx.getId())
            .transactionId(tx.getTransactionId())
            .userId(tx.getUserId())
            .userEmail(tx.getUserEmail())
            .amount(tx.getAmount())
            .currency(tx.getCurrency())
            .merchantName(tx.getMerchantName())
            .merchantCategory(tx.getMerchantCategory())
            .cardType(tx.getCardType())
            .cardLast4(tx.getCardLast4())
            .transactionType(tx.getTransactionType())
            .location(LocationDto.builder()
                .city(tx.getLocationCity())
                .country(tx.getLocationCountry())
                .ipAddress(tx.getLocationIp())
                .build())
            .deviceType(tx.getDeviceType())
            .deviceOs(tx.getDeviceOs())
            .fraudScore(tx.getFraudScore())
            .fraudConfidence(tx.getFraudConfidence())
            .fraudPrediction(tx.getFraudPrediction())
            .fraudFactors(parseFraudFactors(tx.getFraudFactors()))
            .modelVersion(tx.getModelVersion())
            .fraudFinalDecision(tx.getFraudFinalDecision())
            .transactionStatus(tx.getTransactionStatus())
            .processingTimeMs(tx.getProcessingTimeMs())
            .manualReviewNotes(tx.getManualReviewNotes())
            .manualReviewReason(tx.getManualReviewReason())
            .reviewedAt(tx.getReviewedAt() != null ? tx.getReviewedAt().format(FMT) + "Z" : null)
            .createdAt(tx.getCreatedAt() != null ? tx.getCreatedAt().format(FMT) + "Z" : null)
            .updatedAt(tx.getUpdatedAt() != null ? tx.getUpdatedAt().format(FMT) + "Z" : null)
            .auditHistory(audit)
            .build();
    }

    private List<RiskFactor> parseFraudFactors(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    @Transactional
    public ApiResponse<TransactionDto> evaluateTransaction(EvaluateTransactionReq req) {
        long startMs = System.currentTimeMillis();

        // Idempotency check
        Optional<Transaction> existing = transactionRepo.findByTransactionId(req.getTransactionId());
        if (existing.isPresent()) {
            log.info("Idempotency hit for transaction {}", req.getTransactionId());
            return ApiResponse.ok(toDtoWithAudit(existing.get()));
        }

        // Simulate ML scoring (random 0-100; in production this calls the ML service)
        int fraudScore = simulateFraudScore(req);
        int confidence  = Math.min(99, fraudScore + (int)(Math.random() * 6));
        String prediction = fraudScore > 50 ? "REJECT" : "APPROVE";

        // Decision engine thresholds (from PRD section 5.2)
        String finalDecision;
        String status;
        if (fraudScore < 20) {
            finalDecision = "APPROVED"; status = "APPROVED";
        } else if (fraudScore >= 85) {
            finalDecision = "REJECTED"; status = "REJECTED";
        } else {
            finalDecision = null; status = "MANUAL_REVIEW";
        }

        // Build risk factors
        List<Map<String, Object>> factorsList = buildSimulatedFactors(fraudScore);
        String factorsJson;
        try { factorsJson = objectMapper.writeValueAsString(factorsList); }
        catch (Exception e) { factorsJson = "[]"; }

        int processingMs = (int)(System.currentTimeMillis() - startMs) + 15; // add base processing time

        Transaction tx = Transaction.builder()
            .transactionId(req.getTransactionId())
            .userId(req.getUserId())
            .userEmail(req.getUserEmail())
            .amount(req.getAmount())
            .currency(req.getCurrency() != null ? req.getCurrency() : "USD")
            .merchantName(req.getMerchantName())
            .merchantCategory(req.getMerchantCategory())
            .cardType(req.getCardType())
            .cardLast4(req.getCardLast4())
            .transactionType(req.getTransactionType())
            .locationCity(req.getLocationCity())
            .locationCountry(req.getLocationCountry())
            .locationIp(req.getLocationIp())
            .deviceType(req.getDeviceType())
            .deviceOs(req.getDeviceOs())
            .fraudScore(fraudScore)
            .fraudConfidence(confidence)
            .fraudPrediction(prediction)
            .fraudFactors(factorsJson)
            .modelVersion("v2.1.0")
            .fraudFinalDecision(finalDecision)
            .transactionStatus(status)
            .processingTimeMs(processingMs)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        transactionRepo.save(tx);

        log.info("Transaction {} evaluated: score={} decision={} in {}ms",
            req.getTransactionId(), fraudScore, status, processingMs);

        // Async Kafka publish (prod only — null in dev)
        if (kafkaProducer != null) {
            try {
                Map<String, Object> kafkaPayload = new HashMap<>();
                kafkaPayload.put("transactionId", req.getTransactionId());
                kafkaPayload.put("fraudScore", fraudScore);
                kafkaPayload.put("status", status);
                kafkaPayload.put("processingMs", processingMs);
                kafkaPayload.put("amount", req.getAmount());
                kafkaPayload.put("userId", req.getUserId());
                kafkaProducer.publishTransaction(req.getTransactionId(), kafkaPayload);

                // Publish audit event
                Map<String, Object> auditPayload = new HashMap<>();
                auditPayload.put("transactionId", req.getTransactionId());
                auditPayload.put("action", "DECISION_MADE");
                auditPayload.put("decision", status);
                auditPayload.put("score", fraudScore);
                kafkaProducer.publishAuditEvent(req.getTransactionId(), auditPayload);

                // Publish alert for high-risk transactions
                if (fraudScore >= 70) {
                    Map<String, Object> alertPayload = new HashMap<>();
                    alertPayload.put("transactionId", req.getTransactionId());
                    alertPayload.put("fraudScore", fraudScore);
                    alertPayload.put("amount", req.getAmount());
                    alertPayload.put("severity", fraudScore >= 85 ? "CRITICAL" : "HIGH");
                    kafkaProducer.publishFraudAlert(req.getTransactionId(), alertPayload);
                }
            } catch (Exception e) {
                log.warn("Kafka publish failed (non-fatal): {}", e.getMessage());
            }
        }

        return ApiResponse.ok(toDtoWithAudit(tx));
    }

    private int simulateFraudScore(EvaluateTransactionReq req) {
        // Try calling ML service first (prod profile — service must be running)
        try {
            String url = mlServiceUrl + "/api/v1/predict";
            Map<String, Object> mlReq = new HashMap<>();
            mlReq.put("transactionId",    req.getTransactionId());
            mlReq.put("userId",           req.getUserId());
            mlReq.put("userEmail",        req.getUserEmail());
            mlReq.put("amount",           req.getAmount());
            mlReq.put("merchantCategory", req.getMerchantCategory());
            mlReq.put("cardType",         req.getCardType());
            mlReq.put("cardLast4",        req.getCardLast4());
            mlReq.put("transactionType",  req.getTransactionType());
            mlReq.put("locationCountry",  req.getLocationCountry());
            mlReq.put("locationCity",     req.getLocationCity());
            mlReq.put("locationIp",       req.getLocationIp());
            mlReq.put("deviceType",       req.getDeviceType());
            mlReq.put("deviceOs",         req.getDeviceOs());

            @SuppressWarnings("unchecked")
            Map<String, Object> mlResp = restTemplate.postForObject(url, mlReq, Map.class);
            if (mlResp != null && mlResp.get("riskScore") != null) {
                int score = ((Number) mlResp.get("riskScore")).intValue();
                log.debug("ML service returned score={} for tx={}", score, req.getTransactionId());
                return score;
            }
        } catch (Exception ex) {
            log.warn("⚠️ ML service unavailable ({}), falling back to heuristic scorer", ex.getMessage());
        }

        // Heuristic fallback (dev profile or when ML service is unreachable)
        double score = 10 + Math.random() * 50;
        if (req.getAmount() != null && req.getAmount().doubleValue() > 5000) score += 20;
        if (req.getAmount() != null && req.getAmount().doubleValue() > 15000) score += 15;
        if ("GAMBLING".equalsIgnoreCase(req.getMerchantCategory())) score += 25;
        if ("JEWELRY".equalsIgnoreCase(req.getMerchantCategory())) score += 15;
        if (req.getLocationCountry() != null && !req.getLocationCountry().equalsIgnoreCase("US")) score += 10;
        return (int) Math.min(99, score);
    }

    private List<Map<String, Object>> buildSimulatedFactors(int score) {
        if (score > 70) return List.of(
            Map.of("factor","high_amount","weight",0.35,"explanation","Transaction amount 8x higher than user average"),
            Map.of("factor","unusual_merchant","weight",0.28,"explanation","First time purchasing from this merchant"),
            Map.of("factor","time_anomaly","weight",0.22,"explanation","Transaction at unusual hour")
        );
        if (score > 40) return List.of(
            Map.of("factor","amount_deviation","weight",0.30,"explanation","Amount 2x higher than 30-day average"),
            Map.of("factor","velocity_check","weight",0.25,"explanation","3 transactions in last hour")
        );
        return List.of(Map.of("factor","normal_pattern","weight",0.10,"explanation","Transaction matches user spending patterns"));
    }
}
