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
    private final EmailService emailService;

    @Override
    public void sendSOSAlert(Device device, Location location) {
        String message = "CẢNH BÁO SOS: Thiết bị " + device.getName() + " đang yêu cầu trợ giúp khẩn cấp!";
        // Location.getTimestamp() đã được set đúng từ IngestService
        createAndSendAlert(device, location, AlertType.SOS, message, location.getTimestamp());
    }

    @Override
    public void sendLostAlert(Device device, Location location) {
        String message = "CẢNH BÁO MẤT TÍN HIỆU: Thiết bị " + device.getName() + " được báo cáo bị thất lạc.";
        createAndSendAlert(device, location, AlertType.LOST, message, location.getTimestamp());
    }

    @Override
    public void sendGeofenceAlert(Device device, String typeStr, String geofenceName, double lat, double lng, double radius, LocalDateTime eventTime) {
        String message;
        Location location = new Location();
        location.setLatitude(lat);
        location.setLongitude(lng);
        // Set đúng thời gian sự kiện
        location.setTimestamp(eventTime);

        AlertType alertType;
        if ("GEOFENCE_BREACH".equals(typeStr)) {
            alertType = AlertType.GEOFENCE_BREACH;
            message = "CẢNH BÁO VÙNG AN TOÀN: " + device.getName() + " đã RA KHỎI vùng " + geofenceName;
        } else {
            alertType = AlertType.GEOFENCE_RETURN;
            message = "THÔNG BÁO AN TOÀN: " + device.getName() + " đã QUAY LẠI vùng " + geofenceName;
        }

        createAndSendAlert(device, location, alertType, message, eventTime);
    }

    // Thêm tham số timestamp vào hàm này
    private void createAndSendAlert(Device device, Location location, AlertType alertType, String message, LocalDateTime timestamp) {
        try {
            User user = device.getOwner();
            if (user == null) {
                log.warn("Device {} has no owner, skipping alert", device.getId());
                return;
            }

            Alert alert = new Alert();
            alert.setDevice(device);
            alert.setAlertType(alertType);
            alert.setMessage(message);
            // LƯU ĐÚNG THỜI GIAN THIẾT BỊ GỬI, KO PHẢI GIỜ SERVER
            alert.setTimestamp(timestamp != null ? timestamp : LocalDateTime.now());
            alert.setIsRead(false);

            if (alertType == AlertType.GEOFENCE_BREACH || alertType == AlertType.GEOFENCE_RETURN) {
                alert.setLocation(null);
            } else {
                alert.setLocation(location);
            }

            alertService.createAlert(alert);
            log.info("📢 Alert created via WebSocket: [{}] {} at {}", alertType, message, timestamp);

            log.info("📧 Sending alert email to user: {}", user.getEmail());
            emailService.sendAlertEmail(user, device, location, alertType, message);

        } catch (Exception e) {
            log.error("Failed to create alert or send email", e);
        }
    }
}