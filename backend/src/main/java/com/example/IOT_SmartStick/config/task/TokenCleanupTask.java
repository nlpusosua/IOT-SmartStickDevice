package com.example.IOT_SmartStick.config.task;


import com.example.IOT_SmartStick.repository.InvalidatedTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@EnableScheduling // Bật tính năng lập lịch
@RequiredArgsConstructor
@Slf4j // Để log (tùy chọn)
public class TokenCleanupTask {

    private final InvalidatedTokenRepository invalidatedTokenRepository;

    // Chạy vào 3 giờ sáng mỗi ngày
    @Scheduled(cron = "0 0 3 * * ?")
    public void cleanupExpiredTokens() {
        log.info("Running scheduled task to clean up expired blacklisted tokens...");
        LocalDateTime now = LocalDateTime.now();
        invalidatedTokenRepository.deleteByExpiryDateBefore(now);
        log.info("Token cleanup finished.");
    }
}
