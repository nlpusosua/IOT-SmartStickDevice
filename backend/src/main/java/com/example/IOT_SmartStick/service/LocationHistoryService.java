// service/LocationHistoryService.java
package com.example.IOT_SmartStick.service;

import com.example.IOT_SmartStick.dto.response.LocationHistoryDTO;

import java.time.LocalDateTime;

public interface LocationHistoryService {
    LocationHistoryDTO getDeviceHistory(Long deviceId, LocalDateTime startTime, LocalDateTime endTime, String token);
    LocationHistoryDTO getDeviceRecentHistory(Long deviceId, int hours, String token);
}