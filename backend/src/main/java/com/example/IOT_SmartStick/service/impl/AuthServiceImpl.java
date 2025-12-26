package com.example.IOT_SmartStick.service.impl;

import com.example.IOT_SmartStick.constant.UserRole;
import com.example.IOT_SmartStick.constant.UserStatus;
import com.example.IOT_SmartStick.dto.request.LoginRequest;
import com.example.IOT_SmartStick.dto.request.RefreshTokenRequest;
import com.example.IOT_SmartStick.dto.request.SignUpRequest;
import com.example.IOT_SmartStick.dto.response.AuthResponse;
import com.example.IOT_SmartStick.entity.User;
import com.example.IOT_SmartStick.entity.VerificationToken;
import com.example.IOT_SmartStick.repository.UserRepository;
import com.example.IOT_SmartStick.repository.VerificationTokenRepository;
import com.example.IOT_SmartStick.service.AuthService;
import com.example.IOT_SmartStick.service.EmailService;
import com.example.IOT_SmartStick.service.JwtService;
import com.example.IOT_SmartStick.service.RedisTokenService;  // ← THÊM
import com.example.IOT_SmartStick.service.RefreshTokenService;
import io.jsonwebtoken.Claims;
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
import java.util.Date;
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
    private final RedisTokenService redisTokenService;
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

        if (user.getStatus() == UserStatus.BANNED) {
            throw new DisabledException("Tài khoản của bạn đã bị khóa bởi Admin.");
        }

        final String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = refreshTokenService.createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpiration())
                .message("Login successful")
                .role(user.getRole())
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

        Claims claims = jwtService.extractClaim(accessToken, c -> c);
        Date expiration = claims.getExpiration();
        long expirationSeconds = (expiration.getTime() - System.currentTimeMillis()) / 1000;

        if (expirationSeconds > 0) {
            redisTokenService.addToBlacklist(accessToken, expirationSeconds);  // ← THAY ĐỔI
        }
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

        Integer userId = refreshTokenService.verifyRefreshToken(refreshTokenString);  // ← THAY ĐỔI

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String newAccessToken = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshTokenString)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpiration())
                .message("Token refreshed successfully")
                .build();
    }
}