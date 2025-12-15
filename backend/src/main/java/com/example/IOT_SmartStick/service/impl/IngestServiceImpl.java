// service/impl/IngestServiceImpl.java
package com.example.IOT_SmartStick.service.impl;

import com.example.IOT_SmartStick.constant.DeviceStatus;
import com.example.IOT_SmartStick.dto.sendSignal.IngestLocationRequest;
import com.example.IOT_SmartStick.entity.Device;
import com.example.IOT_SmartStick.entity.Location;
import com.example.IOT_SmartStick.repository.DeviceRepository;
import com.example.IOT_SmartStick.repository.LocationRepository;
import com.example.IOT_SmartStick.service.IngestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class IngestServiceImpl implements IngestService {

    private final DeviceRepository deviceRepository;
    private final LocationRepository locationRepository;

    @Override
    @Transactional // QUAN TRỌNG: Đảm bảo cả 2 thao tác cùng thành công
    public void ingestDeviceData(String authHeader, IngestLocationRequest payload) {
        // 1. Xác thực token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new SecurityException("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        Device device = deviceRepository.findByDeviceToken(token)
                .orElseThrow(() -> new SecurityException("Invalid device token: " + token));

        log.info("✅ Authenticated device: {} (ID: {})", device.getName(), device.getId());

        // 2. Validate dữ liệu GPS
        if (payload.getGps() == null ||
                payload.getGps().getLatitude() == null ||
                payload.getGps().getLongitude() == null) {
            throw new IllegalArgumentException("GPS data is missing");
        }

        Double latitude = payload.getGps().getLatitude().doubleValue();
        Double longitude = payload.getGps().getLongitude().doubleValue();

        // 3. Parse timestamp
        LocalDateTime timestamp;
        try {
            timestamp = LocalDateTime.parse(
                    payload.getTimestamp(),
                    DateTimeFormatter.ISO_DATE_TIME
            );
        } catch (Exception e) {
            log.warn("Invalid timestamp format, using server time");
            timestamp = LocalDateTime.now();
        }

        // 4. LƯU LỊCH SỬ VÀO BẢNG LOCATION
        Location newLocation = Location.builder()
                .device(device)
                .latitude(latitude)
                .longitude(longitude)
                .timestamp(timestamp)
                .build();
        locationRepository.save(newLocation);
        log.info("📍 Saved location history for device: {}", device.getName());

        // 5. CẬP NHẬT CACHE VÀO BẢNG DEVICE (LOGIC MỚI)
        device.setLastLatitude(latitude);
        device.setLastLongitude(longitude);
        device.setLastSeen(LocalDateTime.now());
        device.setStatus(DeviceStatus.ONLINE); // Đánh dấu thiết bị online

        deviceRepository.save(device);
        log.info("🔄 Updated device cache: {} - Lat: {}, Lng: {}",
                device.getName(), latitude, longitude);

        // 6. Xử lý SOS và Geofence (nếu cần)
        if (payload.getStatus() != null) {
            boolean isSOS = Boolean.TRUE.equals(payload.getStatus().getSos());

            if (isSOS) {
                log.warn("🚨 SOS ALERT from device: {}", device.getName());
                // TODO: Gửi thông báo khẩn cấp
            }

        }
    }
}