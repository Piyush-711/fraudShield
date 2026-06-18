package com.fraudshield.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "notification_type")
    private String notificationType; // FRAUD_ALERT, SYSTEM_ALERT, REPORT_READY, etc.

    @Column(name = "recipient_id")
    private Long recipientId;

    @Column(name = "recipient_email")
    private String recipientEmail;

    // Content
    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "related_transaction_id")
    private String relatedTransactionId;

    // Channel
    @Column(nullable = false)
    private String channel = "EMAIL"; // EMAIL, SLACK, IN_APP

    // Status
    private String status = "QUEUED"; // QUEUED, SENT, FAILED, BOUNCED

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    // Error Handling
    @Column(name = "retry_count")
    private Integer retryCount = 0;

    @Column(name = "last_error_message", columnDefinition = "TEXT")
    private String lastErrorMessage;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
