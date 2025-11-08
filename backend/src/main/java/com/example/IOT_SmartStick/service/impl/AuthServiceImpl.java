package com.example.IOT_SmartStick.service.impl;

import com.example.IOT_SmartStick.constant.UserRole;
import com.example.IOT_SmartStick.constant.UserStatus;
import com.example.IOT_SmartStick.dto.request.LoginRequest;
import com.example.IOT_SmartStick.dto.request.RefreshTokenRequest;
import com.example.IOT_SmartStick.dto.request.SignUpRequest;
import com.example.IOT_SmartStick.dto.response.AuthResponse;
import com.example.IOT_SmartStick.entity.InvalidatedToken;
import com.example.IOT_SmartStick.entity.RefreshToken;
import com.example.IOT_SmartStick.entity.User;
import com.example.IOT_SmartStick.entity.VerificationToken;
import com.example.IOT_SmartStick.repository.InvalidatedTokenRepository;
import com.example.IOT_SmartStick.repository.UserRepository;
import com.example.IOT_SmartStick.repository.VerificationTokenRepository;
import com.example.IOT_SmartStick.service.AuthService;
import com.example.IOT_SmartStick.service.EmailService;
import com.example.IOT_SmartStick.service.JwtService;
import com.example.IOT_SmartStick.service.RefreshTokenService;
import jakarta.servlet.http.HttpServletRequest;
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
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.ZoneId;
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
    private final InvalidatedTokenRepository invalidatedTokenRepository;
    private final RefreshTokenService refreshTokenService;

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
                .status(UserStatus.PENDING_VERIFICATION)
                .build();

        User savedUser = userRepository.save(user);

        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken(token, savedUser);
        tokenRepository.save(verificationToken);

        emailService.sendVerificationEmail(savedUser, token);

        return AuthResponse.builder()
                .accessToken(null)
                .refreshToken(null)
                .tokenType("Bearer")
                .expiresIn(null)
                .message("Sign up successful. Please check your email to verify your account.")
                .build();
    }

    @Override
    @Transactional
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
        final User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Tạo access token
        final String accessToken = jwtService.generateToken(userDetails);

        // Tạo refresh token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpiration())
                .message("Login successful")
                .build();
    }

    @Override
    public void verifyAccount(String token) {
        VerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(verificationToken);
            throw new IllegalArgumentException("Token has expired. Please sign up again.");
        }

        User user = verificationToken.getUser();
        if (user.getStatus() != UserStatus.ACTIVE) {
            user.setStatus(UserStatus.ACTIVE);
            userRepository.save(user);
        }

        tokenRepository.delete(verificationToken);
    }

    @Override
    @Transactional
    public void logout(HttpServletRequest request) {
        final String authHeader = request.getHeader("Authorization");

        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
            return;
        }

        final String accessToken = authHeader.substring(7);

        // Lấy ngày hết hạn từ access token
        var expiryDate = jwtService.extractClaim(accessToken, claims -> claims.getExpiration())
                .toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();

        // Lưu access token vào blacklist
        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .token(accessToken)
                .expiryDate(expiryDate)
                .build();
        invalidatedTokenRepository.save(invalidatedToken);

        // Lấy refresh token từ request body hoặc header (nếu có)
        // Để đơn giản, bạn có thể thu hồi tất cả refresh token của user
        String userEmail = jwtService.extractUsername(accessToken);
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user != null) {
            refreshTokenService.revokeAllUserRefreshTokens(user);
        }
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshTokenString = request.getRefreshToken();

        // Verify refresh token
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(refreshTokenString);
        User user = refreshToken.getUser();

        // Tạo access token mới
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String newAccessToken = jwtService.generateToken(userDetails);

        // Option 1: Giữ nguyên refresh token cũ
        // Option 2: Tạo refresh token mới (rotation strategy - bảo mật cao hơn)
        // Ở đây tôi chọn Option 1 - giữ nguyên refresh token

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshTokenString) // Giữ nguyên refresh token
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpiration())
                .message("Token refreshed successfully")
                .build();
    }
}