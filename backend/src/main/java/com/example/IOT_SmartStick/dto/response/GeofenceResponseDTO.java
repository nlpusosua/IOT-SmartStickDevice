package com.example.IOT_SmartStick.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GeofenceResponseDTO {
    private Long id;
    private String name;
    private BigDecimal centerLatitude;
    private BigDecimal centerLongitude;
    private Integer radiusMeters;
    private Boolean active;
    private Long deviceId;
    private String deviceName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}