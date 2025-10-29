package com.example.IOT_SmartStick.service.impl;

import com.example.IOT_SmartStick.constant.UserRole;
import com.example.IOT_SmartStick.constant.UserStatus;
import com.example.IOT_SmartStick.dto.request.LoginRequest;
import com.example.IOT_SmartStick.dto.request.SignUpRequest;
import com.example.IOT_SmartStick.dto.response.AuthResponse;
import com.example.IOT_SmartStick.entity.User;
import com.example.IOT_SmartStick.entity.VerificationToken;
import com.example.IOT_SmartStick.repository.UserRepository;
import com.example.IOT_SmartStick.repository.VerificationTokenRepository;
import com.example.IOT_SmartStick.service.AuthService;
import com.example.IOT_SmartStick.service.EmailService;
import com.example.IOT_SmartStick.service.JwtService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final VerificationTokenRepository tokenRepository;
    private final EmailService emailService;
    @Override
    @Transactional
    public AuthResponse signUp(SignUpRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(UserRole.CAREGIVER)
                .status(UserStatus.PENDING_VERIFICATION) // Vẫn là PENDING
                .build();

        // 1. Lưu user trước
        User savedUser = userRepository.save(user);

        // 2. Tạo token
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken(token, savedUser);
        tokenRepository.save(verificationToken);

        // 3. Gửi email (nên chạy bất đồng bộ @Async để user không phải chờ)
        emailService.sendVerificationEmail(savedUser, token);

        return AuthResponse.builder()
                .token(null)
                .message("Sign up successful. Please check your email to verify your account.")
                .build();
    }
    @Override
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid email or password");
        } catch (DisabledException e) {
            throw new DisabledException("Your account is not activated. Please check your email.");
        } catch (Exception e) {
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        final String jwt = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(jwt)
                .message("Login successful")
                .build();
    }

    @Override
    public void verifyAccount(String token) {
        // Tìm token
        VerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));

        // Kiểm tra token hết hạn
        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(verificationToken); // Xóa token cũ
            throw new IllegalArgumentException("Token has expired. Please sign up again.");
        }

        // Kích hoạt user
        User user = verificationToken.getUser();
        if (user.getStatus() != UserStatus.ACTIVE) {
            user.setStatus(UserStatus.ACTIVE);
            userRepository.save(user);
        }

        // Xóa token sau khi dùng
        tokenRepository.delete(verificationToken);
    }
}
