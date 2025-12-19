package com.example.IOT_SmartStick.dto.response;

import com.example.IOT_SmartStick.constant.AlertType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AlertResponseDTO {
    private Long id;
    private AlertType alertType;
    private String message;
    private LocalDateTime timestamp;
    private Boolean isRead;

    // Device info
    private Long deviceId;
    private String deviceName;

    // Location info
    private Double latitude;
    private Double longitude;
}