package com.example.IOT_SmartStick.service;

import com.example.IOT_SmartStick.exception.RedisException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisTokenService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String BLACKLIST_PREFIX = "blacklist:access:";
    private static final String REFRESH_TOKEN_PREFIX = "refresh:token:";
    private static final String USER_REFRESH_PREFIX = "user:refresh:";

    // ========== ACCESS TOKEN BLACKLIST ==========

    public void addToBlacklist(String token, long expirationSeconds) {
        try {
            String key = BLACKLIST_PREFIX + token;
            redisTemplate.opsForValue().set(key, "revoked", expirationSeconds, TimeUnit.SECONDS);
            log.info("Added token to blacklist: {}", token.substring(0, 10) + "...");
        } catch (RedisConnectionFailureException e) {
            log.error("Redis connection failed while adding to blacklist", e);
            throw new RedisException("Unable to connect to Redis server", e);
        } catch (Exception e) {
            log.error("Error adding token to blacklist", e);
            throw new RedisException("Failed to add token to blacklist", e);
        }
    }

    public boolean isBlacklisted(String token) {
        try {
            String key = BLACKLIST_PREFIX + token;
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));
        } catch (RedisConnectionFailureException e) {
            log.error("Redis connection failed while checking blacklist", e);
            return false;
        } catch (Exception e) {
            log.error("Error checking blacklist", e);
            return false;
        }
    }

    // ========== REFRESH TOKEN ==========

    public void saveRefreshToken(String tokenId, Integer userId, long expirationSeconds) {
        try {
            String tokenKey = REFRESH_TOKEN_PREFIX + tokenId;
            redisTemplate.opsForValue().set(tokenKey, userId, expirationSeconds, TimeUnit.SECONDS);

            String userKey = USER_REFRESH_PREFIX + userId;
            redisTemplate.opsForSet().add(userKey, tokenId);
            redisTemplate.expire(userKey, Duration.ofSeconds(expirationSeconds));

            log.info("Saved refresh token for user: {}", userId);
        } catch (RedisConnectionFailureException e) {
            log.error("Redis connection failed while saving refresh token", e);
            throw new RedisException("Unable to connect to Redis server", e);
        } catch (Exception e) {
            log.error("Error saving refresh token", e);
            throw new RedisException("Failed to save refresh token", e);
        }
    }

    public Integer getUserIdByRefreshToken(String tokenId) {
        try {
            String key = REFRESH_TOKEN_PREFIX + tokenId;
            Object userId = redisTemplate.opsForValue().get(key);
            return userId != null ? (Integer) userId : null;
        } catch (RedisConnectionFailureException e) {
            log.error("Redis connection failed while getting userId", e);
            throw new RedisException("Unable to connect to Redis server", e);
        } catch (Exception e) {
            log.error("Error getting userId by refresh token", e);
            return null;
        }
    }

    public boolean existsRefreshToken(String tokenId) {
        try {
            String key = REFRESH_TOKEN_PREFIX + tokenId;
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));
        } catch (RedisConnectionFailureException e) {
            log.error("Redis connection failed while checking token existence", e);
            throw new RedisException("Unable to connect to Redis server", e);
        } catch (Exception e) {
            log.error("Error checking refresh token existence", e);
            return false;
        }
    }

    public void revokeRefreshToken(String tokenId, Integer userId) {
        try {
            String tokenKey = REFRESH_TOKEN_PREFIX + tokenId;
            redisTemplate.delete(tokenKey);

            if (userId != null) {
                String userKey = USER_REFRESH_PREFIX + userId;
                redisTemplate.opsForSet().remove(userKey, tokenId);
            }

            log.info("Revoked refresh token: {}", tokenId);
        } catch (RedisConnectionFailureException e) {
            log.error("Redis connection failed while revoking token", e);
            throw new RedisException("Unable to connect to Redis server", e);
        } catch (Exception e) {
            log.error("Error revoking refresh token", e);
            throw new RedisException("Failed to revoke refresh token", e);
        }
    }

    public void revokeAllUserRefreshTokens(Integer userId) {
        try {
            String userKey = USER_REFRESH_PREFIX + userId;
            Set<Object> tokens = redisTemplate.opsForSet().members(userKey);

            if (tokens != null && !tokens.isEmpty()) {
                tokens.forEach(token -> {
                    String tokenKey = REFRESH_TOKEN_PREFIX + token;
                    redisTemplate.delete(tokenKey);
                });
                redisTemplate.delete(userKey);
                log.info("Revoked all refresh tokens for user: {}", userId);
            }
        } catch (RedisConnectionFailureException e) {
            log.error("Redis connection failed while revoking all tokens", e);
            throw new RedisException("Unable to connect to Redis server", e);
        } catch (Exception e) {
            log.error("Error revoking all user refresh tokens", e);
            throw new RedisException("Failed to revoke all refresh tokens", e);
        }
    }

    public long getTokenTTL(String tokenId) {
        try {
            String key = REFRESH_TOKEN_PREFIX + tokenId;
            Long ttl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
            return ttl != null ? ttl : -1;
        } catch (Exception e) {
            log.error("Error getting token TTL", e);
            return -1;
        }
    }
}