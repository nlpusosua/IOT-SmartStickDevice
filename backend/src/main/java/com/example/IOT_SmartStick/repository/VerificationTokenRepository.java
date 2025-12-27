package com.example.IOT_SmartStick.repository;

import com.example.IOT_SmartStick.entity.User;
import com.example.IOT_SmartStick.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findByToken(String token);
    Optional<VerificationToken> findByUser(User user);
}
