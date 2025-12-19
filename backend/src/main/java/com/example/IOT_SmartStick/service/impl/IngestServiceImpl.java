package com.example.IOT_SmartStick.service.impl;

import com.example.IOT_SmartStick.constant.DeviceStatus;
import com.example.IOT_SmartStick.dto.sendSignal.IngestLocationRequest;
import com.example.IOT_SmartStick.entity.Device;
import com.example.IOT_SmartStick.entity.Geofence;
import com.example.IOT_SmartStick.entity.Location;
import com.example.IOT_SmartStick.repository.DeviceRepository;
import com.example.IOT_SmartStick.repository.GeofenceRepository;
import com.example.IOT_SmartStick.repository.LocationRepository;
import com.example.IOT_SmartStick.service.IngestService;
import com.example.IOT_SmartStick.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class IngestServiceImpl implements IngestService {

    private final DeviceRepository deviceRepository;
    private final LocationRepository locationRepository;
    private final GeofenceRepository geofenceRepository;
    private final NotificationService notificationService;
    @Override
    @Transactional
    public void ingestDeviceData(String authHeader, IngestLocationRequest payload) {

        // 1. Validate Token từ Body
        String deviceTokenFromBody = payload.getDeviceToken();
        if (deviceTokenFromBody == null || deviceTokenFromBody.isEmpty()) {
            throw new IllegalArgumentException("Device Token is missing in request body");
        }

        Device device = deviceRepository.findByDeviceToken(deviceTokenFromBody)
                .orElseThrow(() -> new SecurityException("Device not found with token: " + deviceTokenFromBody));

        // 2. Validate GPS
        if (payload.getGps() == null || payload.getGps().getLatitude() == null || payload.getGps().getLongitude() == null) {
            throw new IllegalArgumentException("GPS data is missing");
        }

        Double latitude = payload.getGps().getLatitude().doubleValue();
        Double longitude = payload.getGps().getLongitude().doubleValue();

        // 3. Parse Time
        LocalDateTime timestamp;
        try {
            timestamp = LocalDateTime.parse(payload.getTimestamp(), DateTimeFormatter.ISO_DATE_TIME);
        } catch (Exception e) {
            timestamp = LocalDateTime.now();
        }

        // 4. Lưu Lịch sử Location
        Location newLocation = Location.builder()
                .device(device)
                .latitude(latitude)
                .longitude(longitude)
                .timestamp(timestamp)
                .build();
        Location savedLocation = locationRepository.save(newLocation);

        // 5. Check Geofence (Vùng an toàn)
        checkGeofenceViolation(device, latitude, longitude);

        // 6. Cập nhật trạng thái Device
        device.setLastLatitude(latitude);
        device.setLastLongitude(longitude);
        device.setLastSeen(LocalDateTime.now());
        device.setStatus(DeviceStatus.ONLINE);
        deviceRepository.save(device);

        // 7. Xử lý SOS và LOST
        if (payload.getStatus() != null) {
            if (Boolean.TRUE.equals(payload.getStatus().getSos())) {
                log.warn("🚨 SOS DETECTED: {}", device.getName());
                // GỌI NOTIFICATION SERVICE
                notificationService.sendSOSAlert(device, savedLocation);
            }

            if (Boolean.TRUE.equals(payload.getStatus().getLost())) {
                log.warn("📍 LOST DETECTED: {}", device.getName());
                // GỌI NOTIFICATION SERVICE
                notificationService.sendLostAlert(device, savedLocation);
            }
        }
    }

    private void checkGeofenceViolation(Device device, Double latitude, Double longitude) {
        List<Geofence> activeGeofences = geofenceRepository.findByDeviceIdAndActiveTrue(device.getId());

        if (activeGeofences.isEmpty()) {
            device.setGeofenceStatus("NO_GEOFENCE");
            return;
        }

        boolean insideAny = false;
        Geofence violatedGeofence = null;

        for (Geofence geofence : activeGeofences) {
            if (geofence.isPointInside(latitude, longitude)) {
                insideAny = true;
                break;
            } else {
                violatedGeofence = geofence; // Lưu tạm vùng bị vi phạm
            }
        }

        String oldStatus = device.getGeofenceStatus();
        String newStatus = insideAny ? "INSIDE" : "OUTSIDE";
        device.setGeofenceStatus(newStatus);

        // Chỉ gửi thông báo khi trạng thái thay đổi
        if (!newStatus.equals(oldStatus)) {
            if ("OUTSIDE".equals(newStatus) && violatedGeofence != null) {
                // Gửi cảnh báo RA KHỎI vùng
                notificationService.sendGeofenceAlert(
                        device,
                        "GEOFENCE_BREACH",
                        violatedGeofence.getName(),
                        violatedGeofence.getCenterLatitude().doubleValue(),
                        violatedGeofence.getCenterLongitude().doubleValue(),
                        Double.valueOf(violatedGeofence.getRadiusMeters()) // Đảm bảo truyền Double
                );
            } else if ("INSIDE".equals(newStatus)) {
                // Gửi thông báo QUAY LẠI vùng
                Geofence currentZone = activeGeofences.get(0);
                notificationService.sendGeofenceAlert(
                        device,
                        "GEOFENCE_RETURN",
                        currentZone.getName(),
                        currentZone.getCenterLatitude().doubleValue(),
                        currentZone.getCenterLongitude().doubleValue(),
                        Double.valueOf(currentZone.getRadiusMeters())
                );
            }
        }
    }
}