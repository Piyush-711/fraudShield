package com.fraudshield.controller;

import com.fraudshield.dto.Dtos.*;
import com.fraudshield.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin settings and user management")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/settings")
    @Operation(summary = "Get current system configuration")
    public SettingsDto getSettings() {
        return adminService.getSettings();
    }

    @PutMapping("/settings")
    @Operation(summary = "Update system configuration thresholds")
    public ResponseEntity<ApiResponse<SettingsDto>> saveSettings(@RequestBody SettingsDto dto) {
        ApiResponse<SettingsDto> result = adminService.saveSettings(dto);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/users")
    @Operation(summary = "Get all system users")
    public List<UserDto> getUsers() {
        return adminService.getAllUsers();
    }

    @PostMapping("/users")
    @Operation(summary = "Create a new user account")
    public ResponseEntity<ApiResponse<UserDto>> createUser(@RequestBody CreateUserReq req) {
        ApiResponse<UserDto> result = adminService.createUser(req);
        return result.isSuccess()
            ? ResponseEntity.status(201).body(result)
            : ResponseEntity.badRequest().body(result);
    }
}
