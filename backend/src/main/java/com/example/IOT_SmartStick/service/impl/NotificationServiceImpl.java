package com.example.IOT_SmartStick.service.impl;

import com.example.IOT_SmartStick.constant.AlertType;
import com.example.IOT_SmartStick.entity.Alert;
import com.example.IOT_SmartStick.entity.Device;
import com.example.IOT_SmartStick.entity.Location;
import com.example.IOT_SmartStick.entity.User;
import com.example.IOT_SmartStick.service.AlertService;
import com.example.IOT_SmartStick.service.EmailService;
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
    private final EmailService emailService; // Inject EmailService

    @Override
    public void sendSOSAlert(Device device, Location location) {
        String message = "CẢNH BÁO SOS: Thiết bị " + device.getName() + " đang yêu cầu trợ giúp khẩn cấp!";
        createAndSendAlert(device, location, AlertType.SOS, message);
    }

    @Override
    public void sendLostAlert(Device device, Location location) {
        String message = "CẢNH BÁO MẤT TÍN HIỆU: Thiết bị " + device.getName() + " được báo cáo bị thất lạc.";
        createAndSendAlert(device, location, AlertType.LOST, message);
    }

    @Override
    public void sendGeofenceAlert(Device device, String typeStr, String geofenceName, double lat, double lng, double radius) {
        String message;
        Location location = new Location();
        location.setLatitude(lat);
        location.setLongitude(lng);
        // Lưu ý: Timestamp cho location ảo này lấy thời gian hiện tại
        location.setTimestamp(LocalDateTime.now());

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

    private void createAndSendAlert(Device device, Location location, AlertType alertType, String message) {
        try {
            User user = device.getOwner();
            if (user == null) {
                log.warn("Device {} has no owner, skipping alert", device.getId());
                return;
            }

            // 1. Tạo Alert và lưu vào DB + Gửi WebSocket (thông qua AlertService)
            Alert alert = new Alert();
            alert.setDevice(device);
            alert.setAlertType(alertType);
            alert.setMessage(message);
            alert.setTimestamp(LocalDateTime.now());
            alert.setIsRead(false);

            // Xử lý logic gán location cho Alert
            if (alertType == AlertType.GEOFENCE_BREACH || alertType == AlertType.GEOFENCE_RETURN) {
                // Geofence alert thường dùng tọa độ tâm vùng hoặc tọa độ thiết bị tại thời điểm đó
                // Ở đây logic cũ của bạn set null, tôi giữ nguyên logic DB nhưng khi gửi mail sẽ dùng tham số location truyền vào
                alert.setLocation(null);
            } else {
                alert.setLocation(location);
            }

            alertService.createAlert(alert);
            log.info("📢 Alert created and sent via WebSocket: [{}] {}", alertType, message);

            // 2. Gửi Email Cảnh báo (Tính năng mới)
            // Gửi bất kể loại alert nào trong danh sách (SOS, LOST, GEOFENCE)
            log.info("📧 Sending alert email to user: {}", user.getEmail());
            emailService.sendAlertEmail(user, device, location, alertType, message);

        } catch (Exception e) {
            log.error("Failed to create alert or send email", e);
        }
    }
}