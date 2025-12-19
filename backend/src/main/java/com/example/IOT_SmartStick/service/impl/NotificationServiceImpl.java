package com.example.IOT_SmartStick.service.impl;

import com.example.IOT_SmartStick.constant.AlertType;
import com.example.IOT_SmartStick.entity.Alert;
import com.example.IOT_SmartStick.entity.Device;
import com.example.IOT_SmartStick.entity.Location;
import com.example.IOT_SmartStick.entity.User;
import com.example.IOT_SmartStick.service.AlertService;
import com.example.IOT_SmartStick.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final AlertService alertService;

    @Override
    public void sendSOSAlert(Device device, Location location) {
        String message = "CẢNH BÁO SOS: Thiết bị " + device.getName() + " đang yêu cầu trợ giúp khẩn cấp!";
        // Truyền Enum AlertType.SOS
        createAndSendAlert(device, location, AlertType.SOS, message);
    }

    @Override
    public void sendLostAlert(Device device, Location location) {
        String message = "CẢNH BÁO MẤT TÍN HIỆU: Thiết bị " + device.getName() + " được báo cáo bị thất lạc.";
        // Truyền Enum AlertType.LOST
        createAndSendAlert(device, location, AlertType.LOST, message);
    }

    @Override
    public void sendGeofenceAlert(Device device, String typeStr, String geofenceName, double lat, double lng, double radius) {
        String message;
        Location location = new Location();
        location.setLatitude(lat);
        location.setLongitude(lng);

        // Xác định kiểu AlertType từ String truyền vào
        AlertType alertType;
        if ("GEOFENCE_BREACH".equals(typeStr)) {
            alertType = AlertType.GEOFENCE_BREACH;
            message = "CẢNH BÁO VÙNG AN TOÀN: " + device.getName() + " đã RA KHỎI vùng " + geofenceName;
        } else {
            alertType = AlertType.GEOFENCE_RETURN;
            message = "THÔNG BÁO AN TOÀN: " + device.getName() + " đã QUAY LẠI vùng " + geofenceName;
        }

        createAndSendAlert(device, location, alertType, message);
    }

    // [FIXED] Đổi tham số alertType từ String sang Enum AlertType để khớp với Entity
    private void createAndSendAlert(Device device, Location location, AlertType alertType, String message) {
        try {
            User user = device.getOwner();
            if (user == null) {
                log.warn("Device {} has no owner, skipping alert", device.getId());
                return;
            }

            Alert alert = new Alert();
            alert.setDevice(device);
            // [FIXED] Đã xóa alert.setUser(user) vì Entity Alert không có trường User

            alert.setAlertType(alertType); // Set Enum
            alert.setMessage(message);
            alert.setTimestamp(LocalDateTime.now());
            alert.setIsRead(false);

            // Nếu bạn muốn lưu location vào bảng alert (nếu có cột location_id)
            if (location != null && location.getId() != null) {
                alert.setLocation(location);
            }
            // Lưu ý: Nếu Location là đối tượng mới chưa save vào DB thì set vào đây có thể lỗi TransientObjectException
            // Trong IngestService, bạn đã save Location rồi truyền vào đây nên ổn.
            // Tuy nhiên với GeofenceAlert, location là new Location() chưa save -> nên để null location trong alert geofence
            if (alertType == AlertType.GEOFENCE_BREACH || alertType == AlertType.GEOFENCE_RETURN) {
                alert.setLocation(null); // Không lưu location ID ảo
            } else {
                alert.setLocation(location);
            }

            // Gọi AlertService để lưu DB và bắn WebSocket
            alertService.createAlert(alert);

            log.info("📢 Alert created and sent via WebSocket: [{}] {}", alertType, message);
        } catch (Exception e) {
            log.error("Failed to create alert", e);
        }
    }
}