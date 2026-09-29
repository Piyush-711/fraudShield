package com.fraudshield.service;

import com.fraudshield.dto.Dtos.ChartDataPoint;
import com.fraudshield.dto.Dtos.DashboardMetrics;
import com.fraudshield.entity.Transaction;
import com.fraudshield.repository.AlertRepository;
import com.fraudshield.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private TransactionRepository transactionRepo;

    @Mock
    private AlertRepository alertRepo;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void getMetrics_calculatesAccurateMetricsWithoutFakeMinimums() {
        when(transactionRepo.countSince(any(LocalDateTime.class))).thenReturn(100L);
        when(transactionRepo.countHighRiskSince(any(LocalDateTime.class))).thenReturn(5L);
        when(transactionRepo.countPendingReviews()).thenReturn(2L);
        when(alertRepo.countActive()).thenReturn(1L);
        when(transactionRepo.avgProcessingTimeSince(any(LocalDateTime.class))).thenReturn(80.0);
        when(transactionRepo.countBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(80L);
        when(transactionRepo.countHighRiskBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(4L);

        DashboardMetrics metrics = dashboardService.getMetrics();

        assertThat(metrics.getTotalTransactions()).isEqualTo(100L);
        assertThat(metrics.getPendingReviews()).isEqualTo(2L);
        assertThat(metrics.getActiveAlerts()).isEqualTo(1L);
        assertThat(metrics.getFraudRate()).isEqualTo(5.0);
        assertThat(metrics.getLatencyStatus()).isEqualTo("GOOD");
    }

    @Test
    void getChartData_generates24HourlyBucketsAccurately() {
        LocalDateTime now = LocalDateTime.now();
        Transaction t1 = Transaction.builder()
            .transactionId("TX1")
            .createdAt(now.minusHours(2))
            .fraudScore(85)
            .build();
        Transaction t2 = Transaction.builder()
            .transactionId("TX2")
            .createdAt(now.minusHours(2))
            .fraudScore(10)
            .build();

        when(transactionRepo.findByCreatedAtAfterOrderByCreatedAtAsc(any(LocalDateTime.class)))
            .thenReturn(List.of(t1, t2));

        List<ChartDataPoint> chartData = dashboardService.getChartData();

        assertThat(chartData).hasSize(24);
        int totalTransactionsInChart = chartData.stream().mapToInt(ChartDataPoint::getTransactions).sum();
        assertThat(totalTransactionsInChart).isEqualTo(2);
    }
}
