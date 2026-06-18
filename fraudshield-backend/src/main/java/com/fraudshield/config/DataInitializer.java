package com.fraudshield.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fraudshield.entity.*;
import com.fraudshield.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepo;
    private final TransactionRepository txRepo;
    private final AlertRepository alertRepo;
    private final SystemConfigRepository configRepo;
    private final ModelVersionRepository modelVersionRepo;
    private final FraudDetectionRuleRepository ruleRepo;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Random random = new Random();

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedConfig();
        seedModelVersions();
        seedFraudRules();
        seedTransactions();
        seedAlerts();
        log.info("✅ FraudShield seed data loaded successfully!");
    }

    private void seedUsers() {
        if (userRepo.count() > 0) return;
        List<AppUser> users = List.of(
            AppUser.builder().email("admin@fraudshield.com").name("Admin User").role("SYSTEM_ADMIN").passwordHash(passwordEncoder.encode("admin123")).isActive(true).lastLoginAt(LocalDateTime.now()).build(),
            AppUser.builder().email("analyst@fraudshield.com").name("John Analyst").role("ANALYST_REVIEWER").passwordHash(passwordEncoder.encode("analyst123")).isActive(true).lastLoginAt(LocalDateTime.now().minusHours(2)).build(),
            AppUser.builder().email("viewer@fraudshield.com").name("Jane Viewer").role("ANALYST_VIEWER").passwordHash(passwordEncoder.encode("viewer123")).isActive(true).lastLoginAt(LocalDateTime.now().minusDays(1)).build(),
            AppUser.builder().email("alice@fraudshield.com").name("Alice ML").role("DATA_SCIENTIST").passwordHash(passwordEncoder.encode("alice123")).isActive(true).lastLoginAt(LocalDateTime.now().minusHours(5)).build(),
            AppUser.builder().email("mike@fraudshield.com").name("Mike Ops").role("OPERATOR").passwordHash(passwordEncoder.encode("mike123")).isActive(true).lastLoginAt(LocalDateTime.now().minusDays(2)).build()
        );
        userRepo.saveAll(users);
        log.info("👤 Seeded {} users", users.size());
    }

    private void seedConfig() {
        if (configRepo.count() > 0) return;
        configRepo.save(SystemConfig.builder()
            .autoApprovalThreshold(20).manualReviewThreshold(70).autoRejectionThreshold(85)
            .maxTransactionsPerMinute(10000).maxTransactionsPerUserHour(1000)
            .transactionTimeoutMs(200).kafkaConsumerThreads(3).redisCacheTtlHours(1)
            .alertSeverityThreshold("HIGH").emailNotificationsEnabled(true).slackNotificationsEnabled(true)
            .build());
    }

    private void seedTransactions() throws JsonProcessingException {
        if (txRepo.count() > 0) return;
        String[][] merchants = {{"Amazon.com","SHOPPING"},{"Jewelry Palace","JEWELRY"},{"Grand Hotel NYC","HOTEL"},{"Best Buy","ELECTRONICS"},{"Starbucks","FOOD"},{"Walmart","RETAIL"},{"Apple Store","ELECTRONICS"},{"Casino Royale","GAMBLING"},{"United Airlines","TRAVEL"},{"Luxury Boutique","LUXURY"},{"Netflix","ENTERTAINMENT"},{"Shell Gas","GAS_STATION"}};
        String[][] locations = {{"San Francisco","US","192.168.1.100"},{"New York","US","10.0.0.55"},{"Las Vegas","US","172.16.0.23"},{"Miami","US","192.168.2.45"},{"London","GB","85.12.34.56"},{"Tokyo","JP","203.45.67.89"}};

        int[][] presets = {{92,5200,0},{88,12500,1},{85,3400,2},{79,7800,3},{15,250,4},{8,89,5},{95,18000,0},{12,45,6},{67,1200,7},{22,380,8},{91,9500,0},{5,60,9},{74,2100,10},{18,199,8},{83,6700,1},{35,890,3},{97,25000,0},{44,640,7},{88,4300,2},{9,29,5}};
        String[] statuses = {"MANUAL_REVIEW","REJECTED","MANUAL_REVIEW","MANUAL_REVIEW","APPROVED","APPROVED","REJECTED","APPROVED","MANUAL_REVIEW","APPROVED","REJECTED","APPROVED","MANUAL_REVIEW","APPROVED","REJECTED","APPROVED","REJECTED","APPROVED","MANUAL_REVIEW","APPROVED"};

        for (int i = 0; i < presets.length; i++) {
            int score = presets[i][0];
            int amount = presets[i][1];
            int mIdx = presets[i][2];
            String status = statuses[i];
            String[] m = merchants[mIdx % merchants.length];
            String[] loc = locations[i % locations.length];
            LocalDateTime created = LocalDateTime.now().minusMinutes(random.nextInt(1440));

            String factors = objectMapper.writeValueAsString(buildFactors(score));

            Transaction tx = Transaction.builder()
                .transactionId("TXN_" + String.format("%03d", i+1))
                .userId("USER_" + (1000 + i))
                .userEmail("customer" + (i+1) + "@gmail.com")
                .amount(BigDecimal.valueOf(amount))
                .currency("USD")
                .merchantName(m[0])
                .merchantCategory(m[1])
                .cardType(i % 2 == 0 ? "CREDIT" : "DEBIT")
                .cardLast4(String.format("%04d", 1000 + i * 37))
                .transactionType(i % 3 == 0 ? "IN_PERSON" : "ONLINE")
                .locationCity(loc[0]).locationCountry(loc[1]).locationIp(loc[2])
                .deviceType(i % 2 == 0 ? "MOBILE" : "DESKTOP")
                .deviceOs(i % 2 == 0 ? "iOS" : "Android")
                .fraudScore(score)
                .fraudConfidence(Math.min(99, score + 5))
                .fraudPrediction(score > 50 ? "REJECT" : "APPROVE")
                .fraudFactors(factors)
                .modelVersion("v2.1.0")
                .fraudFinalDecision(status.equals("MANUAL_REVIEW") ? null : status)
                .transactionStatus(status)
                .processingTimeMs(20 + random.nextInt(160))
                .createdAt(created)
                .updatedAt(created)
                .build();

            txRepo.save(tx);
        }
        log.info("💳 Seeded {} transactions", presets.length);
    }

    private List<Map<String, Object>> buildFactors(int score) {
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

    private void seedModelVersions() {
        if (modelVersionRepo.count() > 0) return;
        List<ModelVersion> versions = List.of(
            ModelVersion.builder()
                .modelVersion("v2.1.0").modelDescription("Gradient Boosting fraud detector - production")
                .accuracyRate(95.8).precisionRate(94.2).recallRate(96.1).f1Score(95.1)
                .isActive(true).isCanary(false).canaryPercentage(0)
                .activatedAt(LocalDateTime.now().minusDays(30))
                .build(),
            ModelVersion.builder()
                .modelVersion("v2.0.3").modelDescription("Previous stable version")
                .accuracyRate(93.5).precisionRate(92.0).recallRate(94.7).f1Score(93.3)
                .isActive(false).isCanary(false).canaryPercentage(0)
                .activatedAt(LocalDateTime.now().minusDays(90))
                .deactivatedAt(LocalDateTime.now().minusDays(30))
                .build()
        );
        modelVersionRepo.saveAll(versions);
        log.info("🤖 Seeded {} model versions", versions.size());
    }

    private void seedFraudRules() throws JsonProcessingException {
        if (ruleRepo.count() > 0) return;
        List<FraudDetectionRule> rules = List.of(
            FraudDetectionRule.builder()
                .name("High Amount Threshold").description("Flag transactions above $10,000")
                .ruleType("THRESHOLD").priority(200).enabled(true).isSystemRule(true)
                .ruleCondition(objectMapper.writeValueAsString(Map.of("field","amount","operator","greater_than","value",10000)))
                .ruleAction("FLAG_FOR_REVIEW").riskScoreImpact(20.0).confidenceWeight(1.0)
                .build(),
            FraudDetectionRule.builder()
                .name("Velocity Check - 5 per hour").description("Flag if user submits >5 transactions in 1 hour")
                .ruleType("VELOCITY").priority(150).enabled(true).isSystemRule(true)
                .ruleCondition(objectMapper.writeValueAsString(Map.of("field","transaction_count_1h","operator","greater_than","value",5)))
                .ruleAction("FLAG_FOR_REVIEW").riskScoreImpact(15.0).confidenceWeight(0.9)
                .build(),
            FraudDetectionRule.builder()
                .name("International Transaction").description("Flag transactions from non-US locations")
                .ruleType("GEOLOCATION").priority(100).enabled(true).isSystemRule(false)
                .ruleCondition(objectMapper.writeValueAsString(Map.of("field","location_country","operator","not_in","value",Set.of("US"))))
                .ruleAction("FLAG_FOR_REVIEW").riskScoreImpact(10.0).confidenceWeight(0.7)
                .build(),
            FraudDetectionRule.builder()
                .name("Gambling Merchant Auto-Review").description("Always review gambling merchant transactions")
                .ruleType("PATTERN").priority(180).enabled(true).isSystemRule(true)
                .ruleCondition(objectMapper.writeValueAsString(Map.of("field","merchant_category","operator","equals","value","GAMBLING")))
                .ruleAction("FLAG_FOR_REVIEW").riskScoreImpact(25.0).confidenceWeight(1.0)
                .build()
        );
        ruleRepo.saveAll(rules);
        log.info("📋 Seeded {} fraud detection rules", rules.size());
    }

    private void seedAlerts() {
        if (alertRepo.count() > 0) return;
        List<SystemAlert> alerts = List.of(
            SystemAlert.builder().alertType("FRAUD_DETECTED").severity("CRITICAL").title("High Risk Transaction Detected").message("Transaction $25,000 (TXN_017) detected as critical fraud risk (97/100) at Luxury Boutique").status("ACTIVE").transactionId("TXN_017").createdAt(LocalDateTime.now().minusMinutes(5)).build(),
            SystemAlert.builder().alertType("PERF_DEGRADED").severity("HIGH").title("P95 Latency Spike Detected").message("P95 transaction processing latency exceeded 250ms. Current: 287ms").status("ACTIVE").createdAt(LocalDateTime.now().minusMinutes(8)).build(),
            SystemAlert.builder().alertType("INFRA_ALERT").severity("MEDIUM").title("Kafka Consumer Lag High").message("Kafka topic consumer lag exceeded 500ms. Current lag: 620ms").status("ACTIVE").createdAt(LocalDateTime.now().minusMinutes(20)).build(),
            SystemAlert.builder().alertType("FRAUD_DETECTED").severity("CRITICAL").title("High Risk Transaction Detected").message("Transaction $18,000 (TXN_007) detected as high fraud risk (95/100)").status("ACKNOWLEDGED").transactionId("TXN_007").acknowledgedBy("john@bank.com").acknowledgedAt(LocalDateTime.now().minusHours(1)).createdAt(LocalDateTime.now().minusHours(2)).build(),
            SystemAlert.builder().alertType("SECURITY_ALERT").severity("HIGH").title("Multiple Failed Login Attempts").message("5 failed login attempts for user from IP 203.45.67.89").status("ACKNOWLEDGED").acknowledgedBy("admin@fraudshield.com").acknowledgedAt(LocalDateTime.now().minusHours(3)).createdAt(LocalDateTime.now().minusHours(3).minusMinutes(30)).build(),
            SystemAlert.builder().alertType("SERVICE_DOWN").severity("CRITICAL").title("Fraud Detection Service Down").message("Python FastAPI fraud detection service is unreachable. Fallback rules activated.").status("RESOLVED").acknowledgedBy("mike@fraudshield.com").acknowledgedAt(LocalDateTime.now().minusHours(5)).resolvedAt(LocalDateTime.now().minusHours(4).minusMinutes(40)).createdAt(LocalDateTime.now().minusHours(5).minusMinutes(15)).build()
        );
        alertRepo.saveAll(alerts);
        log.info("🔔 Seeded {} alerts", alerts.size());
    }
}
