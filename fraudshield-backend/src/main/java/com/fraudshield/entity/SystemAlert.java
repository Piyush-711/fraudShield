package com.fraudshield.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_alerts")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SystemAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "alert_type", nullable = false)
    private String alertType;  // FRAUD_DETECTED, PERF_DEGRADED, SERVICE_DOWN, INFRA_ALERT, SECURITY_ALERT

    @Column(nullable = false)
    private String severity;   // LOW, MEDIUM, HIGH, CRITICAL

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    private String status = "ACTIVE"; // ACTIVE, ACKNOWLEDGED, RESOLVED, ESCALATED

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "acknowledged_by")
    private String acknowledgedBy;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }
}
