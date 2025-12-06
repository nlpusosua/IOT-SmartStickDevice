package com.example.IOT_SmartStick.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminDeviceRequestDTO {
    @NotBlank(message = "Device token is required")
    private String deviceToken;

    // Có thể để trống, nếu trống hệ thống tự đặt tên mặc định
    private String name;
}