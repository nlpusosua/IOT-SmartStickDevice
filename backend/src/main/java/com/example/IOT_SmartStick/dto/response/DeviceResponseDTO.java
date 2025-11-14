package com.example.IOT_SmartStick.dto.response;

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
    private Integer id;
    private String name;
    private String deviceToken;
    private LocalDateTime createdAt;
    private Integer ownerId;
    private String ownerName;
}
