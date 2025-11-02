package com.example.IOT_SmartStick.repository;

import com.example.IOT_SmartStick.entity.InvalidatedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, Long> {

    // Tìm token trong blacklist
    Optional<InvalidatedToken> findByToken(String token);

    // Xóa các token đã hết hạn (để dọn dẹp DB)
    void deleteByExpiryDateBefore(LocalDateTime now);
}
