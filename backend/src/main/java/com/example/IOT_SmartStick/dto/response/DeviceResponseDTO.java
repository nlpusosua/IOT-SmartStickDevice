package com.example.IOT_SmartStick.dto.response;

import com.example.IOT_SmartStick.constant.DeviceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeviceResponseDTO {
    private Long id;
    private String name;
    private String deviceToken;
    private DeviceStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdate;
    private Integer ownerId;
    private String ownerName;
}
