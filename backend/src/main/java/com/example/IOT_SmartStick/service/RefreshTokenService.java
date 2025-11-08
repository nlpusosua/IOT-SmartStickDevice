package com.example.IOT_SmartStick.service;

import com.example.IOT_SmartStick.entity.RefreshToken;
import com.example.IOT_SmartStick.entity.User;
import com.example.IOT_SmartStick.repository.RefreshTokenRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;

    /**
     * Tạo refresh token mới cho user
     */
    @Transactional
    public RefreshToken createRefreshToken(User user) {
        // Xóa các refresh token cũ của user (nếu muốn chỉ cho phép 1 device)
        // refreshTokenRepository.deleteByUser(user);

        String tokenString = jwtService.generateRefreshToken();
        long expirationMs = jwtService.getRefreshTokenExpiration();
        LocalDateTime expiryDate = LocalDateTime.now().plusSeconds(expirationMs / 1000);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenString)
                .user(user)
                .expiryDate(expiryDate)
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    /**
     * Tìm và validate refresh token
     */
    public RefreshToken verifyRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Refresh token not found"));

        // Kiểm tra token đã bị revoke chưa
        if (refreshToken.isRevoked()) {
            throw new IllegalArgumentException("Refresh token has been revoked");
        }

        // Kiểm tra token hết hạn chưa
        if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new IllegalArgumentException("Refresh token has expired");
        }

        return refreshToken;
    }

    /**
     * Thu hồi refresh token (khi logout)
     */
    @Transactional
    public void revokeRefreshToken(String token) {
        Optional<RefreshToken> refreshToken = refreshTokenRepository.findByToken(token);
        refreshToken.ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }

    /**
     * Thu hồi tất cả refresh token của user (logout all devices)
     */
    @Transactional
    public void revokeAllUserRefreshTokens(User user) {
        refreshTokenRepository.deleteByUser(user);
    }

    /**
     * Xóa các refresh token đã hết hạn (cleanup task)
     */
    @Transactional
    public void cleanupExpiredTokens() {
        refreshTokenRepository.deleteByExpiryDateBefore(LocalDateTime.now());
    }
}
