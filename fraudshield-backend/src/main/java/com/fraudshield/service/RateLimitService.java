package com.fraudshield.service;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Sliding window rate limiter.
 * Uses Redis in 'prod' profile; falls back to concurrent in-memory tracker in 'dev' or if Redis is down.
 */
@Service
@Slf4j
public class RateLimitService {

    private static final String RATE_LIMIT_PREFIX = "ratelimit:user:";

    @Autowired(required = false)
    private RedisTemplate<String, String> redisTemplate;

    @Getter
    @Value("${fraudshield.rate-limit.max-requests-per-minute:1000}")
    private int maxRequestsPerMinute = 1000;

    private final ConcurrentHashMap<String, UserWindow> inMemoryTracker = new ConcurrentHashMap<>();

    public RateLimitService() {
        this.redisTemplate = null;
        this.maxRequestsPerMinute = 1000;
    }

    public RateLimitService(RedisTemplate<String, String> redisTemplate, int maxRequestsPerMinute) {
        this.redisTemplate = redisTemplate;
        this.maxRequestsPerMinute = maxRequestsPerMinute;
    }

    private record UserWindow(long windowStartSecond, AtomicInteger counter) {}

    /**
     * Checks whether the user is within the allowed rate limit.
     *
     * @param userId the user identifier to rate-limit
     * @return true if the request is allowed; false if the limit is exceeded
     */
    public boolean isAllowed(String userId) {
        if (userId == null || userId.isBlank()) {
            return true;
        }

        // Try Redis first if configured
        if (redisTemplate != null) {
            String key = RATE_LIMIT_PREFIX + userId;
            try {
                Long count = redisTemplate.opsForValue().increment(key);
                if (count == null) {
                    return true;
                }
                if (count == 1) {
                    redisTemplate.expire(key, Duration.ofSeconds(60));
                }
                if (count > maxRequestsPerMinute) {
                    log.warn("Rate limit exceeded for user {} - {} requests in last 60s (max {})",
                        userId, count, maxRequestsPerMinute);
                    return false;
                }
                return true;
            } catch (Exception e) {
                log.warn("Redis rate limiter unavailable for user {}. Falling back to in-memory: {}", userId, e.getMessage());
            }
        }

        // In-memory sliding window fallback (dev profile or Redis unavailable)
        long currentSec = System.currentTimeMillis() / 1000;
        UserWindow window = inMemoryTracker.compute(userId, (k, prev) -> {
            if (prev == null || currentSec - prev.windowStartSecond >= 60) {
                return new UserWindow(currentSec, new AtomicInteger(1));
            }
            prev.counter.incrementAndGet();
            return prev;
        });

        if (window.counter.get() > maxRequestsPerMinute) {
            log.warn("Rate limit exceeded for user {} (in-memory) - {} requests in last 60s (max {})",
                userId, window.counter.get(), maxRequestsPerMinute);
            return false;
        }
        return true;
    }

    /**
     * Returns the current request count for a user in the sliding window.
     */
    public long getCurrentCount(String userId) {
        if (userId == null || userId.isBlank()) return 0;
        if (redisTemplate != null) {
            String key = RATE_LIMIT_PREFIX + userId;
            try {
                String val = redisTemplate.opsForValue().get(key);
                return val != null ? Long.parseLong(val) : 0;
            } catch (Exception e) {
                // fall through
            }
        }
        UserWindow window = inMemoryTracker.get(userId);
        return window != null ? window.counter.get() : 0;
    }
}
