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
    private Integer autoApprovalThreshold = 20;

    @Column(name = "manual_review_threshold")
    private Integer manualReviewThreshold = 70;

    @Column(name = "auto_rejection_threshold")
    private Integer autoRejectionThreshold = 85;

    @Column(name = "max_transactions_per_minute")
    private Integer maxTransactionsPerMinute = 10000;

    @Column(name = "max_transactions_per_user_hour")
    private Integer maxTransactionsPerUserHour = 1000;

    @Column(name = "transaction_timeout_ms")
    private Integer transactionTimeoutMs = 200;

    @Column(name = "kafka_consumer_threads")
    private Integer kafkaConsumerThreads = 3;

    @Column(name = "redis_cache_ttl_hours")
    private Integer redisCacheTtlHours = 1;

    @Column(name = "alert_severity_threshold")
    private String alertSeverityThreshold = "HIGH";

    @Column(name = "email_notifications_enabled")
    private Boolean emailNotificationsEnabled = true;

    @Column(name = "slack_notifications_enabled")
    private Boolean slackNotificationsEnabled = true;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
