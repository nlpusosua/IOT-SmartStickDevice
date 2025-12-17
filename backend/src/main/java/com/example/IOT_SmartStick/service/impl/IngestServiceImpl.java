package com.example.IOT_SmartStick.service.impl;

import com.example.IOT_SmartStick.constant.DeviceStatus;
import com.example.IOT_SmartStick.dto.sendSignal.IngestLocationRequest;
import com.example.IOT_SmartStick.entity.Device;
import com.example.IOT_SmartStick.entity.Geofence; // Import Entity Geofence
import com.example.IOT_SmartStick.entity.Location;
import com.example.IOT_SmartStick.repository.DeviceRepository;
import com.example.IOT_SmartStick.repository.GeofenceRepository;
import com.example.IOT_SmartStick.repository.LocationRepository;
import com.example.IOT_SmartStick.service.IngestService;
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

    @Override
    @Transactional // Đảm bảo tính toàn vẹn dữ liệu
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

        // 5. XỬ LÝ GEOFENCE (Logic mới thêm vào)
        // Kiểm tra xem tọa độ mới có vi phạm vùng an toàn không trước khi lưu Device
        checkGeofenceViolation(device, latitude, longitude);

        // 6. CẬP NHẬT CACHE VÀO BẢNG DEVICE
        device.setLastLatitude(latitude);
        device.setLastLongitude(longitude);
        device.setLastSeen(LocalDateTime.now());
        device.setStatus(DeviceStatus.ONLINE); // Đánh dấu thiết bị online

        // Lưu Device (Lúc này Device đã chứa cả thông tin vị trí mới VÀ trạng thái Geofence mới)
        deviceRepository.save(device);
        log.info("🔄 Updated device cache & Geofence status: {} - Lat: {}, Lng: {}",
                device.getName(), latitude, longitude);

        // 7. Xử lý SOS (nếu cần)
        if (payload.getStatus() != null) {
            boolean isSOS = Boolean.TRUE.equals(payload.getStatus().getSos());

            if (isSOS) {
                log.warn("🚨 SOS ALERT from device: {}", device.getName());
                // TODO: Gửi thông báo khẩn cấp (Push Notification / Email / SMS)
            }
        }
    }

    /**
     * Hàm kiểm tra xem thiết bị có nằm trong các vùng Geofence (Vùng an toàn) đã kích hoạt hay không.
     */
    private void checkGeofenceViolation(Device device, Double latitude, Double longitude) {
        // Lấy danh sách vùng an toàn đang active của thiết bị này
        List<Geofence> activeGeofences = geofenceRepository.findByDeviceIdAndActiveTrue(device.getId());

        // Nếu không có vùng an toàn nào được cài đặt, set trạng thái là NO_GEOFENCE
        if (activeGeofences.isEmpty()) {
            device.setGeofenceStatus("NO_GEOFENCE");
            return;
        }

        boolean insideAny = false;
        Long violatedGeofenceId = null;

        // Logic: Chỉ cần nằm trong BẤT KỲ vùng an toàn nào thì được coi là an toàn (insideAny = true)
        for (Geofence geofence : activeGeofences) {
            // Lưu ý: Entity Geofence cần phải có method isPointInside(lat, long)
            if (geofence.isPointInside(latitude, longitude)) {
                insideAny = true;
                break; // Đã an toàn, không cần check tiếp
            } else {
                // Tạm lưu ID của vùng bị vi phạm (nếu ra ngoài hết thì cái cuối cùng sẽ được lưu)
                violatedGeofenceId = geofence.getId();
            }
        }

        String oldStatus = device.getGeofenceStatus();
        String newStatus = insideAny ? "INSIDE" : "OUTSIDE";

        // Cập nhật trạng thái vào object Device (chưa lưu DB ngay, sẽ lưu ở bước 6 hàm chính)
        device.setGeofenceStatus(newStatus);

        // Nếu ở ngoài vùng an toàn thì lưu ID của vùng vi phạm, ngược lại thì null
        if (!insideAny) {
            device.setLastViolatedGeofenceId(violatedGeofenceId);
        } else {
            device.setLastViolatedGeofenceId(null);
        }

        // Chỉ log/alert khi trạng thái thay đổi (Ví dụ: Đang ở trong đi ra ngoài, hoặc ngược lại)
        if (oldStatus == null || !newStatus.equals(oldStatus)) {
            if ("OUTSIDE".equals(newStatus)) {
                log.warn("⚠️ GEOFENCE BREACH! Device: {} left safe zone (Geofence ID: {})",
                        device.getName(), violatedGeofenceId);
                // TODO: Tạo Alert trong DB và gửi thông báo real-time ở đây
            } else {
                log.info("✅ Device: {} returned to safe zone", device.getName());
            }
        }
    }
}