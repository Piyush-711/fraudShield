package com.fraudshield.controller;

import com.fraudshield.dto.Dtos.ReportSummary;
import com.fraudshield.repository.AlertRepository;
import com.fraudshield.repository.TransactionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Report generation and summary statistics")
public class ReportController {

    private final TransactionRepository transactionRepo;
    private final AlertRepository alertRepo;

    @GetMapping("/summary")
    @Operation(summary = "Get aggregated report summary statistics for a given period")
    public ReportSummary getSummary(@RequestParam(defaultValue = "30") int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);

        long total        = transactionRepo.countSince(since);
        long approved     = transactionRepo.countByTransactionStatus("APPROVED");
        long rejected     = transactionRepo.countByTransactionStatus("REJECTED");
        long pending      = transactionRepo.countPendingReviews();
        long highRisk     = transactionRepo.countHighRisk();
        long activeAlerts = alertRepo.countByStatus("ACTIVE");

        Double avgMs = transactionRepo.avgProcessingTimeSince(since);
        double fraudRate = total > 0 ? Math.round((double) rejected / total * 1000.0) / 10.0 : 0.0;

        return ReportSummary.builder()
            .totalTransactions(total)
            .approvedTransactions(approved)
            .rejectedTransactions(rejected)
            .pendingReviews(pending)
            .highRiskTransactions(highRisk)
            .fraudRate(fraudRate)
            .avgProcessingTimeMs(avgMs != null ? Math.round(avgMs * 10.0) / 10.0 : 0.0)
            .activeAlerts(activeAlerts)
            .reportPeriod("Last " + days + " days")
            .generatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) + "Z")
            .build();
    }
}
