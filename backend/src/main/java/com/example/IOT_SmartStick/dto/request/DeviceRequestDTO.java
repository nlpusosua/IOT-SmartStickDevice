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
public class DeviceRequestDTO {
    @NotBlank(message = "Device name is required")
    private String name;

    @NotBlank(message = "Device token is required")
    private String deviceToken;
}
