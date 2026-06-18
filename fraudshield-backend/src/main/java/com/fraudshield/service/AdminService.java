package com.fraudshield.service;

import com.fraudshield.dto.Dtos.*;
import com.fraudshield.entity.AppUser;
import com.fraudshield.entity.SystemConfig;
import com.fraudshield.repository.SystemConfigRepository;
import com.fraudshield.repository.UserRepository;
import com.fraudshield.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepo;
    private final SystemConfigRepository configRepo;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    // ─── AUTH ─────────────────────────────────────────────────────────────────
    public ApiResponse<LoginResp> login(LoginReq req) {
        Optional<AppUser> userOpt = userRepo.findByEmail(req.getEmail());
        if (userOpt.isEmpty()) return ApiResponse.error("Invalid email or password");

        AppUser user = userOpt.get();
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash()))
            return ApiResponse.error("Invalid email or password");
        if (Boolean.FALSE.equals(user.getIsActive()))
            return ApiResponse.error("Account is deactivated");

        user.setLastLoginAt(LocalDateTime.now());
        userRepo.save(user);

        String token = jwtService.generateToken(user.getEmail(), user.getRole());
        LoginResp resp = LoginResp.builder()
            .token(token)
            .user(toUserDto(user))
            .build();
        return ApiResponse.ok(resp);
    }

    // ─── USERS ────────────────────────────────────────────────────────────────
    public List<UserDto> getAllUsers() {
        return userRepo.findAll().stream().map(this::toUserDto).toList();
    }

    @Transactional
    public ApiResponse<UserDto> createUser(CreateUserReq req) {
        if (userRepo.existsByEmail(req.getEmail())) {
            return ApiResponse.error("A user with email '" + req.getEmail() + "' already exists");
        }
        String rawPassword = (req.getPassword() != null && !req.getPassword().isBlank())
            ? req.getPassword() : "TempPass123!";
        AppUser user = AppUser.builder()
            .name(req.getName())
            .email(req.getEmail())
            .role(req.getRole())
            .passwordHash(passwordEncoder.encode(rawPassword))
            .isActive(true)
            .lastLoginAt(LocalDateTime.now())
            .build();
        userRepo.save(user);
        log.info("✅ Created new user: {} ({})", req.getName(), req.getEmail());
        return ApiResponse.ok(toUserDto(user));
    }

    // ─── SETTINGS ─────────────────────────────────────────────────────────────
    public SettingsDto getSettings() {
        return configRepo.findAll().stream().findFirst()
            .map(this::toSettingsDto)
            .orElse(defaultSettings());
    }

    @Transactional
    public ApiResponse<SettingsDto> saveSettings(SettingsDto dto) {
        SystemConfig config = configRepo.findAll().stream().findFirst()
            .orElse(new SystemConfig());
        applySettings(config, dto);
        configRepo.save(config);
        return ApiResponse.ok(toSettingsDto(config));
    }

    private void applySettings(SystemConfig c, SettingsDto d) {
        if (d.getAutoApprovalThreshold()  != null) c.setAutoApprovalThreshold(d.getAutoApprovalThreshold());
        if (d.getManualReviewThreshold()  != null) c.setManualReviewThreshold(d.getManualReviewThreshold());
        if (d.getAutoRejectionThreshold() != null) c.setAutoRejectionThreshold(d.getAutoRejectionThreshold());
        if (d.getMaxTransactionsPerMinute()    != null) c.setMaxTransactionsPerMinute(d.getMaxTransactionsPerMinute());
        if (d.getMaxTransactionsPerUserHour()  != null) c.setMaxTransactionsPerUserHour(d.getMaxTransactionsPerUserHour());
        if (d.getTransactionTimeoutMs()        != null) c.setTransactionTimeoutMs(d.getTransactionTimeoutMs());
        if (d.getKafkaConsumerThreads()        != null) c.setKafkaConsumerThreads(d.getKafkaConsumerThreads());
        if (d.getRedisCacheTtlHours()          != null) c.setRedisCacheTtlHours(d.getRedisCacheTtlHours());
        if (d.getAlertSeverityThreshold()      != null) c.setAlertSeverityThreshold(d.getAlertSeverityThreshold());
        if (d.getEmailNotificationsEnabled()   != null) c.setEmailNotificationsEnabled(d.getEmailNotificationsEnabled());
        if (d.getSlackNotificationsEnabled()   != null) c.setSlackNotificationsEnabled(d.getSlackNotificationsEnabled());
    }

    private SettingsDto toSettingsDto(SystemConfig c) {
        return SettingsDto.builder()
            .autoApprovalThreshold(c.getAutoApprovalThreshold())
            .manualReviewThreshold(c.getManualReviewThreshold())
            .autoRejectionThreshold(c.getAutoRejectionThreshold())
            .maxTransactionsPerMinute(c.getMaxTransactionsPerMinute())
            .maxTransactionsPerUserHour(c.getMaxTransactionsPerUserHour())
            .transactionTimeoutMs(c.getTransactionTimeoutMs())
            .kafkaConsumerThreads(c.getKafkaConsumerThreads())
            .redisCacheTtlHours(c.getRedisCacheTtlHours())
            .alertSeverityThreshold(c.getAlertSeverityThreshold())
            .emailNotificationsEnabled(c.getEmailNotificationsEnabled())
            .slackNotificationsEnabled(c.getSlackNotificationsEnabled())
            .build();
    }

    private SettingsDto defaultSettings() {
        return SettingsDto.builder()
            .autoApprovalThreshold(20).manualReviewThreshold(70).autoRejectionThreshold(85)
            .maxTransactionsPerMinute(10000).maxTransactionsPerUserHour(1000)
            .transactionTimeoutMs(200).kafkaConsumerThreads(3).redisCacheTtlHours(1)
            .alertSeverityThreshold("HIGH").emailNotificationsEnabled(true).slackNotificationsEnabled(true)
            .build();
    }

    private UserDto toUserDto(AppUser u) {
        return UserDto.builder()
            .id(u.getId()).name(u.getName()).email(u.getEmail())
            .role(u.getRole()).isActive(u.getIsActive())
            .lastLoginAt(u.getLastLoginAt() != null ? u.getLastLoginAt().format(FMT)+"Z" : null)
            .build();
    }
}
