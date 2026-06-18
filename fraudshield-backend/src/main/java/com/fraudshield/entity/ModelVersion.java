package com.fraudshield.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "model_versions")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ModelVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "model_version", nullable = false, unique = true)
    private String modelVersion;

    @Column(name = "model_md5_hash")
    private String modelMd5Hash;

    @Column(name = "model_file_path")
    private String modelFilePath;

    @Column(name = "model_description", columnDefinition = "TEXT")
    private String modelDescription;

    // Performance Metrics
    @Column(name = "accuracy_rate")
    private Double accuracyRate;

    @Column(name = "precision_rate")
    private Double precisionRate;

    @Column(name = "recall_rate")
    private Double recallRate;

    @Column(name = "f1_score")
    private Double f1Score;

    // Status
    @Column(name = "is_active")
    private Boolean isActive = false;

    @Column(name = "is_canary")
    private Boolean isCanary = false;

    @Column(name = "canary_percentage")
    private Integer canaryPercentage = 0;

    // Metadata
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "activated_at")
    private LocalDateTime activatedAt;

    @Column(name = "deactivated_at")
    private LocalDateTime deactivatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
