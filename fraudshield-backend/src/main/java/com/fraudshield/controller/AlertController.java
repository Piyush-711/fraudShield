package com.fraudshield.controller;

import com.fraudshield.dto.Dtos.*;
import com.fraudshield.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
@Tag(name = "Alerts", description = "System alert management")
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    @Operation(summary = "Get all system alerts ordered by creation time")
    public List<AlertDto> getAllAlerts() {
        return alertService.getAllAlerts();
    }

    @PostMapping("/{id}/acknowledge")
    @Operation(summary = "Update alert status (ACKNOWLEDGED, RESOLVED, ESCALATED)")
    public ResponseEntity<ApiResponse<AlertDto>> acknowledge(
        @PathVariable Long id,
        @RequestBody Map<String, String> body
    ) {
        String action = body.getOrDefault("action", "ACKNOWLEDGED");
        ApiResponse<AlertDto> result = alertService.updateStatus(id, action);
        return result.isSuccess()
            ? ResponseEntity.ok(result)
            : ResponseEntity.badRequest().body(result);
    }
}
