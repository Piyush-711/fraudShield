package com.fraudshield.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Redis-backed sliding window rate limiter.
 * Limits each user to a configurable number of transaction evaluations per minute.
 * Only active in the 'prod' profile.
 */
@Service
@Profile("prod")
@Slf4j
public class RateLimitService {

    private static final String RATE_LIMIT_PREFIX = "ratelimit:user:";

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Value("${fraudshield.rate-limit.max-requests-per-minute:10}")
    private int maxRequestsPerMinute;

    /**
     * Checks whether the user is within the allowed rate limit.
     *
     * @param userId the user identifier to rate-limit
     * @return true if the request is allowed; false if the limit is exceeded
     */
    public boolean isAllowed(String userId) {
        String key = RATE_LIMIT_PREFIX + userId;
        try {
            Long count = redisTemplate.opsForValue().increment(key);
            if (count == null) {
                return true;
            }
            if (count == 1) {
                // First request in window — set TTL of 60 seconds
                redisTemplate.expire(key, Duration.ofSeconds(60));
            }
            if (count > maxRequestsPerMinute) {
                log.warn("🚫 Rate limit exceeded for user {} — {} requests in last 60s (max {})",
                    userId, count, maxRequestsPerMinute);
                return false;
            }
            return true;
        } catch (Exception e) {
            // Fail open: if Redis is unavailable, allow the request (PRD graceful degradation)
            log.error("⚠️ Redis rate limiter unavailable for user {}. Failing open. Error: {}", userId, e.getMessage());
            return true;
        }
    }

    /**
     * Returns the current request count for a user in the sliding window.
     */
    public long getCurrentCount(String userId) {
        String key = RATE_LIMIT_PREFIX + userId;
        try {
            String val = redisTemplate.opsForValue().get(key);
            return val != null ? Long.parseLong(val) : 0;
        } catch (Exception e) {
            return 0;
        }
    }
}
