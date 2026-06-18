package com.fraudshield.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

// ─── Responses ────────────────────────────────────────────────────────────────

public class Dtos {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class LoginReq {
        private String email;
        private String password;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class LoginResp {
        private String token;
        private UserDto user;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserDto {
        private Long id;
        private String name;
        private String email;
        private String role;
        private Boolean isActive;
        private String lastLoginAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RiskFactor {
        private String factor;
        private Double weight;
        private String explanation;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TransactionDto {
        private Long id;
        private String transactionId;
        private String userId;
        private String userEmail;
        private BigDecimal amount;
        private String currency;
        private String merchantName;
        private String merchantCategory;
        private String cardType;
        private String cardLast4;
        private String transactionType;
        private LocationDto location;
        private String deviceType;
        private String deviceOs;
        private Integer fraudScore;
        private Integer fraudConfidence;
        private String fraudPrediction;
        private List<RiskFactor> fraudFactors;
        private String modelVersion;
        private String fraudFinalDecision;
        private String transactionStatus;
        private Integer processingTimeMs;
        private String manualReviewNotes;
        private String manualReviewReason;
        private String reviewedAt;
        private String createdAt;
        private String updatedAt;
        private List<AuditLogDto> auditHistory;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class LocationDto {
        private String city;
        private String country;
        private String ipAddress;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AuditLogDto {
        private Long id;
        private String actionType;
        private String actorType;
        private String actorId;
        private String actorRole;
        private String oldValue;
        private String newValue;
        private String changeReason;
        private String timestamp;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PagedResponse<T> {
        private List<T> content;
        private long totalElements;
        private int totalPages;
        private int size;
        private int number;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DashboardMetrics {
        private long totalTransactions;
        private double totalTransactionsChange;
        private double fraudRate;
        private double fraudRateChange;
        private int p95LatencyMs;
        private String latencyStatus;
        private double falsePositiveRate;
        private double falsePositiveChange;
        private long activeAlerts;
        private long pendingReviews;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ChartDataPoint {
        private String label;
        private int transactions;
        private int fraudDetected;
        private double fraudRate;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AlertDto {
        private Long id;
        private String alertType;
        private String severity;
        private String title;
        private String message;
        private String status;
        private String transactionId;
        private String acknowledgedBy;
        private String acknowledgedAt;
        private String resolvedAt;
        private String createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SettingsDto {
        private Integer autoApprovalThreshold;
        private Integer manualReviewThreshold;
        private Integer autoRejectionThreshold;
        private Integer maxTransactionsPerMinute;
        private Integer maxTransactionsPerUserHour;
        private Integer transactionTimeoutMs;
        private Integer kafkaConsumerThreads;
        private Integer redisCacheTtlHours;
        private String alertSeverityThreshold;
        private Boolean emailNotificationsEnabled;
        private Boolean slackNotificationsEnabled;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ManualReviewReq {
        private String decision;
        private String reason;
        private String notes;
        private Boolean contactCustomer;
        private Boolean flagForInvestigation;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ApiResponse<T> {
        private T data;
        private boolean success;
        private String message;

        public static <T> ApiResponse<T> ok(T data) {
            return ApiResponse.<T>builder().data(data).success(true).message("OK").build();
        }
        public static <T> ApiResponse<T> error(String msg) {
            return ApiResponse.<T>builder().success(false).message(msg).build();
        }
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CreateUserReq {
        private String name;
        private String email;
        private String role;
        private String password;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ReportSummary {
        private Long totalTransactions;
        private Long approvedTransactions;
        private Long rejectedTransactions;
        private Long pendingReviews;
        private Long highRiskTransactions;
        private Double fraudRate;
        private Double avgProcessingTimeMs;
        private Long activeAlerts;
        private String reportPeriod;
        private String generatedAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class EvaluateTransactionReq {
        @jakarta.validation.constraints.NotBlank
        private String transactionId;
        @jakarta.validation.constraints.NotBlank
        private String userId;
        private String userEmail;
        @jakarta.validation.constraints.NotNull
        @jakarta.validation.constraints.Positive
        private java.math.BigDecimal amount;
        private String currency;
        private String merchantName;
        private String merchantCategory;
        private String cardType;
        private String cardLast4;
        private String transactionType;
        private String locationCity;
        private String locationCountry;
        private String locationIp;
        private String deviceType;
        private String deviceOs;
    }
}
