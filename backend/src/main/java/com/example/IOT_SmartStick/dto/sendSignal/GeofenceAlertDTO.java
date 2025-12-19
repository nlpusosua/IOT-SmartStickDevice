package com.example.IOT_SmartStick.dto.sendSignal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GeofenceAlertDTO {
    private String deviceToken;
    private String alertType; // "GEOFENCE_BREACH", "GEOFENCE_RETURN"
    private String geofenceName;
    private Double centerLat;
    private Double centerLng;
    private Integer radiusMeters;
    private Long timestamp;
}