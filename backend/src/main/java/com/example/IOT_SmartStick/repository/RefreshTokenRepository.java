package com.example.IOT_SmartStick.repository;

import com.example.IOT_SmartStick.entity.RefreshToken;
import com.example.IOT_SmartStick.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    // Tìm refresh token theo token string
    Optional<RefreshToken> findByToken(String token);

    // Tìm tất cả refresh token của một user (chưa bị revoke)
    Optional<RefreshToken> findByUserAndRevokedFalse(User user);

    // Xóa các token đã hết hạn (để cleanup)
    void deleteByExpiryDateBefore(LocalDateTime now);

    // Xóa tất cả refresh token của user (khi logout all devices)
    void deleteByUser(User user);
}