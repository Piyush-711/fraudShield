package com.fraudshield.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fraud_detection_rules")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class FraudDetectionRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "rule_type", nullable = false)
    private String ruleType; // THRESHOLD, VELOCITY, PATTERN, GEOLOCATION, DEVICE

    @Column(name = "rule_condition", columnDefinition = "TEXT", nullable = false)
    private String ruleCondition; // JSON stored as text

    @Column(name = "rule_action")
    private String ruleAction; // AUTO_APPROVE, AUTO_REJECT, FLAG_FOR_REVIEW

    @Column(nullable = false)
    @Builder.Default
    private Integer priority = 100;

    @Column(nullable = false)
    @Builder.Default
    private Boolean enabled = true;

    @Column(name = "is_system_rule")
    @Builder.Default
    private Boolean isSystemRule = false;

    @Column(name = "risk_score_impact")
    @Builder.Default
    private Double riskScoreImpact = 0.0;

    @Column(name = "confidence_weight")
    @Builder.Default
    private Double confidenceWeight = 1.0;

    @Column(name = "execution_timeout_ms")
    @Builder.Default
    private Integer executionTimeoutMs = 100;

    @Column(name = "last_triggered_at")
    private LocalDateTime lastTriggeredAt;

    @Column(name = "times_triggered")
    @Builder.Default
    private Integer timesTriggered = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
