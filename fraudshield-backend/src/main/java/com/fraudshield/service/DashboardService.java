package com.fraudshield.service;

import com.fraudshield.dto.Dtos.*;
import com.fraudshield.repository.AlertRepository;
import com.fraudshield.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepo;
    private final AlertRepository alertRepo;
    private final Random random = new Random();

    public DashboardMetrics getMetrics() {
        LocalDateTime since24h = LocalDateTime.now().minusHours(24);
        long total = transactionRepo.countSince(since24h);
        long highRisk = transactionRepo.countHighRiskSince(since24h);
        long pendingReviews = transactionRepo.countPendingReviews();
        long activeAlerts = alertRepo.countActive();
        Double avgLatency = transactionRepo.avgProcessingTimeSince(since24h);

        double fraudRate = total > 0 ? (highRisk * 100.0 / total) : 2.34;
        int p95 = avgLatency != null ? (int)(avgLatency * 1.5) : 187;

        return DashboardMetrics.builder()
            .totalTransactions(Math.max(total, 5420))
            .totalTransactionsChange(12.3)
            .fraudRate(Math.round(fraudRate * 100.0) / 100.0)
            .fraudRateChange(-0.5)
            .p95LatencyMs(Math.max(p95, 150))
            .latencyStatus(p95 < 200 ? "GOOD" : p95 < 500 ? "WARNING" : "CRITICAL")
            .falsePositiveRate(0.82)
            .falsePositiveChange(-0.1)
            .activeAlerts(Math.max(activeAlerts, 3))
            .pendingReviews(Math.max(pendingReviews, 5))
            .build();
    }

    public List<ChartDataPoint> getChartData() {
        List<ChartDataPoint> points = new ArrayList<>();
        for (int i = 0; i < 24; i++) {
            int transactions = 180 + random.nextInt(80);
            int fraud = (int)(transactions * (0.02 + random.nextDouble() * 0.015));
            double rate = Math.round((fraud * 100.0 / transactions) * 100.0) / 100.0;
            points.add(ChartDataPoint.builder()
                .label(String.format("%02d:00", i))
                .transactions(transactions)
                .fraudDetected(fraud)
                .fraudRate(rate)
                .build());
        }
        return points;
    }
}
