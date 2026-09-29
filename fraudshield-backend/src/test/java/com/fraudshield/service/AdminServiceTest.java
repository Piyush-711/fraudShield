package com.fraudshield.service;

import com.fraudshield.dto.Dtos.ApiResponse;
import com.fraudshield.dto.Dtos.UserDto;
import com.fraudshield.entity.AppUser;
import com.fraudshield.repository.SystemConfigRepository;
import com.fraudshield.repository.UserRepository;
import com.fraudshield.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepo;

    @Mock
    private SystemConfigRepository configRepo;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminService adminService;

    @Test
    void toggleUserStatus_togglesActiveStateSuccessfully() {
        AppUser user = AppUser.builder()
            .id(1L)
            .name("Test Analyst")
            .email("analyst@fraudshield.com")
            .role("ANALYST_REVIEWER")
            .isActive(true)
            .build();

        when(userRepo.findById(1L)).thenReturn(Optional.of(user));

        ApiResponse<UserDto> response = adminService.toggleUserStatus(1L);

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getData().getIsActive()).isFalse();
        assertThat(user.getIsActive()).isFalse();
        verify(userRepo).save(user);
    }

    @Test
    void toggleUserStatus_returnsErrorWhenUserNotFound() {
        when(userRepo.findById(99L)).thenReturn(Optional.empty());

        ApiResponse<UserDto> response = adminService.toggleUserStatus(99L);

        assertThat(response.isSuccess()).isFalse();
        assertThat(response.getMessage()).contains("User not found");
    }
}
