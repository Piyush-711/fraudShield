package com.fraudshield.service;

import com.fraudshield.dto.Dtos.*;
import com.fraudshield.entity.Transaction;
import com.fraudshield.repository.AlertRepository;
import com.fraudshield.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepo;
    private final AlertRepository alertRepo;

    public DashboardMetrics getMetrics() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime since24h = now.minusHours(24);
        LocalDateTime since48h = now.minusHours(48);

        long total = transactionRepo.countSince(since24h);
        long highRisk = transactionRepo.countHighRiskSince(since24h);
        long pendingReviews = transactionRepo.countPendingReviews();
        long activeAlerts = alertRepo.countActive();
        Double avgLatency = transactionRepo.avgProcessingTimeSince(since24h);

        long prevTotal = transactionRepo.countBetween(since48h, since24h);
        long prevHighRisk = transactionRepo.countHighRiskBetween(since48h, since24h);

        double fraudRate = total > 0 ? (highRisk * 100.0 / total) : 0.0;
        double prevFraudRate = prevTotal > 0 ? (prevHighRisk * 100.0 / prevTotal) : 0.0;

        double totalTxChange = prevTotal > 0
            ? Math.round(((double) (total - prevTotal) / prevTotal * 100.0) * 10.0) / 10.0
            : 0.0;
        double fraudRateChange = Math.round((fraudRate - prevFraudRate) * 10.0) / 10.0;

        int p95 = avgLatency != null ? (int) Math.round(avgLatency * 1.5) : 0;
        String latencyStatus = (p95 == 0 || p95 < 200) ? "GOOD" : (p95 < 500 ? "WARNING" : "CRITICAL");

        return DashboardMetrics.builder()
            .totalTransactions(total)
            .totalTransactionsChange(totalTxChange)
            .fraudRate(Math.round(fraudRate * 100.0) / 100.0)
            .fraudRateChange(fraudRateChange)
            .p95LatencyMs(p95)
            .latencyStatus(latencyStatus)
            .falsePositiveRate(0.0)
            .falsePositiveChange(0.0)
            .activeAlerts(activeAlerts)
            .pendingReviews(pendingReviews)
            .build();
    }

    public List<ChartDataPoint> getChartData() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime since24h = now.minusHours(23).withMinute(0).withSecond(0).withNano(0);
        List<Transaction> txns = transactionRepo.findByCreatedAtAfterOrderByCreatedAtAsc(since24h);

        Map<Integer, List<Transaction>> hourlyMap = new HashMap<>();
        for (int i = 0; i < 24; i++) {
            hourlyMap.put(i, new ArrayList<>());
        }

        for (Transaction tx : txns) {
            if (tx.getCreatedAt() != null && !tx.getCreatedAt().isBefore(since24h)) {
                long hoursDiff = Duration.between(since24h, tx.getCreatedAt()).toHours();
                int bucketIndex = (int) hoursDiff;
                if (bucketIndex >= 0 && bucketIndex < 24) {
                    hourlyMap.get(bucketIndex).add(tx);
                }
            }
        }

        List<ChartDataPoint> points = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:00");
        for (int i = 0; i < 24; i++) {
            LocalDateTime bucketTime = since24h.plusHours(i);
            List<Transaction> bucketTxns = hourlyMap.get(i);
            int count = bucketTxns.size();
            int fraud = (int) bucketTxns.stream()
                .filter(t -> t.getFraudScore() != null && t.getFraudScore() >= 70)
                .count();
            double rate = count > 0 ? Math.round((fraud * 100.0 / count) * 100.0) / 100.0 : 0.0;

            points.add(ChartDataPoint.builder()
                .label(bucketTime.format(formatter))
                .transactions(count)
                .fraudDetected(fraud)
                .fraudRate(rate)
                .build());
        }
        return points;
    }
}
