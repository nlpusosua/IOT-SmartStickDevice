package com.example.IOT_SmartStick.config.task;

import com.example.IOT_SmartStick.repository.InvalidatedTokenRepository;
import com.example.IOT_SmartStick.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class TokenCleanupTask {

    private final InvalidatedTokenRepository invalidatedTokenRepository;
    private final RefreshTokenService refreshTokenService;

    // Chạy vào 3 giờ sáng mỗi ngày
    @Scheduled(cron = "0 0 3 * * ?")
    public void cleanupExpiredTokens() {
        log.info("Running scheduled task to clean up expired tokens...");

        LocalDateTime now = LocalDateTime.now();

        // Xóa access tokens đã hết hạn trong blacklist
        invalidatedTokenRepository.deleteByExpiryDateBefore(now);
        log.info("Cleaned up expired access tokens from blacklist");

        // Xóa refresh tokens đã hết hạn
        refreshTokenService.cleanupExpiredTokens();
        log.info("Cleaned up expired refresh tokens");

        log.info("Token cleanup finished.");
    }
}