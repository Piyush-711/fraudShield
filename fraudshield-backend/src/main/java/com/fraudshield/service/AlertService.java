package com.fraudshield.service;

import com.fraudshield.dto.Dtos.*;
import com.fraudshield.entity.SystemAlert;
import com.fraudshield.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepo;
    private static final DateTimeFormatter FMT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public List<AlertDto> getAllAlerts() {
        return alertRepo.findAllByOrderByCreatedAtDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public ApiResponse<AlertDto> updateStatus(Long id, String action) {
        return alertRepo.findById(id).map(alert -> {
            alert.setStatus(action);
            if ("ACKNOWLEDGED".equals(action) || "ESCALATED".equals(action)) {
                alert.setAcknowledgedBy("admin@fraudshield.com");
                alert.setAcknowledgedAt(LocalDateTime.now());
            } else if ("RESOLVED".equals(action)) {
                alert.setResolvedAt(LocalDateTime.now());
            }
            alertRepo.save(alert);
            return ApiResponse.ok(toDto(alert));
        }).orElse(ApiResponse.error("Alert not found: " + id));
    }

    private AlertDto toDto(SystemAlert a) {
        return AlertDto.builder()
            .id(a.getId())
            .alertType(a.getAlertType())
            .severity(a.getSeverity())
            .title(a.getTitle())
            .message(a.getMessage())
            .status(a.getStatus())
            .transactionId(a.getTransactionId())
            .acknowledgedBy(a.getAcknowledgedBy())
            .acknowledgedAt(a.getAcknowledgedAt() != null ? a.getAcknowledgedAt().format(FMT)+"Z" : null)
            .resolvedAt(a.getResolvedAt() != null ? a.getResolvedAt().format(FMT)+"Z" : null)
            .createdAt(a.getCreatedAt() != null ? a.getCreatedAt().format(FMT)+"Z" : null)
            .build();
    }
}
