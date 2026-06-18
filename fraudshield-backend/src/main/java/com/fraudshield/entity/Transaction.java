package com.fraudshield.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id", unique = true, nullable = false)
    private String transactionId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "user_email")
    private String userEmail;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(length = 3)
    private String currency = "USD";

    @Column(name = "merchant_name")
    private String merchantName;

    @Column(name = "merchant_category")
    private String merchantCategory;

    @Column(name = "card_type")
    private String cardType;

    @Column(name = "card_last4")
    private String cardLast4;

    @Column(name = "transaction_type")
    private String transactionType;

    // Location
    @Column(name = "location_city")
    private String locationCity;

    @Column(name = "location_country")
    private String locationCountry;

    @Column(name = "location_ip")
    private String locationIp;

    // Device
    @Column(name = "device_type")
    private String deviceType;

    @Column(name = "device_os")
    private String deviceOs;

    // Fraud Detection
    @Column(name = "fraud_score")
    private Integer fraudScore;

    @Column(name = "fraud_confidence")
    private Integer fraudConfidence;

    @Column(name = "fraud_prediction")
    private String fraudPrediction;

    @Column(name = "fraud_factors", columnDefinition = "TEXT")
    private String fraudFactors; // JSON stored as text

    @Column(name = "model_version")
    private String modelVersion;

    @Column(name = "fraud_final_decision")
    private String fraudFinalDecision;

    @Column(name = "transaction_status")
    private String transactionStatus;

    @Column(name = "processing_time_ms")
    private Integer processingTimeMs;

    // Manual Review
    @Column(name = "manual_review_notes", columnDefinition = "TEXT")
    private String manualReviewNotes;

    @Column(name = "manual_review_reason")
    private String manualReviewReason;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewed_by")
    private String reviewedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (currency == null) currency = "USD";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
