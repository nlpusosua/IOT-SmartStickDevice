package com.example.IOT_SmartStick.service;

import com.example.IOT_SmartStick.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final JwtService jwtService;
    private final RedisTokenService redisTokenService;

    public String createRefreshToken(User user) {
        String tokenString = UUID.randomUUID().toString();
        long expirationMs = jwtService.getRefreshTokenExpiration();
        long expirationSeconds = expirationMs / 1000;
        redisTokenService.saveRefreshToken(tokenString, user.getId(), expirationSeconds);
        return tokenString;
    }

    public Integer verifyRefreshToken(String token) {
        if (!redisTokenService.existsRefreshToken(token)) {
            throw new IllegalArgumentException("Refresh token not found or expired");
        }

        Integer userId = redisTokenService.getUserIdByRefreshToken(token);
        if (userId == null) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        return userId;
    }

    public void revokeRefreshToken(String token, Integer userId) {
        redisTokenService.revokeRefreshToken(token, userId);
    }

    public void revokeAllUserRefreshTokens(User user) {
        redisTokenService.revokeAllUserRefreshTokens(user.getId());
    }

    public void cleanupExpiredTokens() {
    }
}