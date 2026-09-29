package com.fraudshield.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_config")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SystemConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "auto_approval_threshold")
    @Builder.Default
    private Integer autoApprovalThreshold = 20;

    @Column(name = "manual_review_threshold")
    @Builder.Default
    private Integer manualReviewThreshold = 70;

    @Column(name = "auto_rejection_threshold")
    @Builder.Default
    private Integer autoRejectionThreshold = 85;

    @Column(name = "max_transactions_per_minute")
    @Builder.Default
    private Integer maxTransactionsPerMinute = 10000;

    @Column(name = "max_transactions_per_user_hour")
    @Builder.Default
    private Integer maxTransactionsPerUserHour = 1000;

    @Column(name = "transaction_timeout_ms")
    @Builder.Default
    private Integer transactionTimeoutMs = 200;

    @Column(name = "kafka_consumer_threads")
    @Builder.Default
    private Integer kafkaConsumerThreads = 3;

    @Column(name = "redis_cache_ttl_hours")
    @Builder.Default
    private Integer redisCacheTtlHours = 1;

    @Column(name = "alert_severity_threshold")
    @Builder.Default
    private String alertSeverityThreshold = "HIGH";

    @Column(name = "email_notifications_enabled")
    @Builder.Default
    private Boolean emailNotificationsEnabled = true;

    @Column(name = "slack_notifications_enabled")
    @Builder.Default
    private Boolean slackNotificationsEnabled = true;

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
