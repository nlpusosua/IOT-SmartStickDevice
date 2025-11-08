package com.example.IOT_SmartStick.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String accessToken;      // Đổi tên từ token -> accessToken
    private String refreshToken;     // Thêm refresh token
    private String tokenType;        // "Bearer"
    private Long expiresIn;          // Thời gian hết hạn của access token (ms)
    private String message;
}