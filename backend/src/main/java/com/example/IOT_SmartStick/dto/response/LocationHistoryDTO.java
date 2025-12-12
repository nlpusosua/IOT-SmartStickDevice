
package com.example.IOT_SmartStick.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LocationHistoryDTO {
    private Long deviceId;
    private String deviceName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer totalPoints;
    private List<LocationPointDTO> path;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LocationPointDTO {
        private Double lat;
        private Double lng;
        private LocalDateTime timestamp;
    }
}
