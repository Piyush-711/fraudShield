package com.fraudshield.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimitServiceTest {

    private RateLimitService rateLimitService;

    @BeforeEach
    void setUp() {
        // null redisTemplate triggers in-memory fallback with limit 5
        rateLimitService = new RateLimitService(null, 5);
    }

    @Test
    void isAllowed_permitsRequestsWithinLimit() {
        String key = "test_user_1";
        for (int i = 0; i < 5; i++) {
            assertThat(rateLimitService.isAllowed(key)).isTrue();
        }
    }

    @Test
    void isAllowed_blocksRequestsExceedingLimit() {
        String key = "test_user_exceed";
        for (int i = 0; i < 5; i++) {
            rateLimitService.isAllowed(key);
        }
        // 6th request in the same window should be blocked
        assertThat(rateLimitService.isAllowed(key)).isFalse();
    }
}
