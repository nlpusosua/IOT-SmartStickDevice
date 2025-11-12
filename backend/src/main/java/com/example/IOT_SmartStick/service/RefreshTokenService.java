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

    /**
     * Tạo refresh token mới cho user
     */
    public String createRefreshToken(User user) {
        // Tạo UUID token
        String tokenString = UUID.randomUUID().toString();

        // Lấy thời gian hết hạn (milliseconds -> seconds)
        long expirationMs = jwtService.getRefreshTokenExpiration();
        long expirationSeconds = expirationMs / 1000;

        // Lưu vào Redis
        redisTokenService.saveRefreshToken(tokenString, user.getId(), expirationSeconds);

        return tokenString;
    }

    /**
     * Verify refresh token
     */
    public Integer verifyRefreshToken(String token) {
        // Kiểm tra token có tồn tại trong Redis không
        if (!redisTokenService.existsRefreshToken(token)) {
            throw new IllegalArgumentException("Refresh token not found or expired");
        }

        // Lấy userId
        Integer userId = redisTokenService.getUserIdByRefreshToken(token);
        if (userId == null) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        return userId;
    }

    /**
     * Thu hồi refresh token (khi logout)
     */
    public void revokeRefreshToken(String token, Integer userId) {
        redisTokenService.revokeRefreshToken(token, userId);
    }

    /**
     * Thu hồi tất cả refresh token của user (logout all devices)
     */
    public void revokeAllUserRefreshTokens(User user) {
        redisTokenService.revokeAllUserRefreshTokens(user.getId());
    }

    /**
     * Cleanup không cần thiết nữa vì Redis tự động xóa khi hết hạn
     */
    public void cleanupExpiredTokens() {
        // Redis tự động xóa key khi hết hạn (TTL)
        // Method này giữ lại để tương thích nhưng không làm gì
    }
}