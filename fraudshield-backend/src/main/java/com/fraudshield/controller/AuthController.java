package com.fraudshield.controller;

import com.fraudshield.dto.Dtos.*;
import com.fraudshield.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login and token management")
public class AuthController {

    private final AdminService adminService;

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and return JWT token")
    public ResponseEntity<ApiResponse<LoginResp>> login(@RequestBody LoginReq req) {
        ApiResponse<LoginResp> result = adminService.login(req);
        return result.isSuccess()
            ? ResponseEntity.ok(result)
            : ResponseEntity.status(401).body(result);
    }
}
