package com.fraudshield.controller;

import com.fraudshield.dto.Dtos.*;
import com.fraudshield.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard metrics and chart data")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/dashboard/metrics")
    @Operation(summary = "Get KPI metrics for the dashboard overview")
    public DashboardMetrics getMetrics() {
        return dashboardService.getMetrics();
    }

    @GetMapping("/dashboard/chart-data")
    @Operation(summary = "Get 24-hour transaction volume and fraud rate chart data")
    public List<ChartDataPoint> getChartData() {
        return dashboardService.getChartData();
    }

    @GetMapping("/health")
    @Operation(summary = "Health check endpoint")
    public Map<String, Object> health() {
        return Map.of(
            "status", "UP",
            "services", Map.of(
                "database", "UP",
                "kafka", "UP",
                "redis", "UP",
                "fraudService", "UP"
            )
        );
    }
}
