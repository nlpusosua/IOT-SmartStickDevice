package com.example.IOT_SmartStick.service.impl;

import com.example.IOT_SmartStick.constant.AlertType;
import com.example.IOT_SmartStick.entity.Device;
import com.example.IOT_SmartStick.entity.Location;
import com.example.IOT_SmartStick.entity.User;
import com.example.IOT_SmartStick.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendVerificationEmail(User user, String token) {
        // --- CẤU HÌNH URL ---
        // Link trỏ về Frontend (ReactJS) thay vì Backend để hiển thị UI đẹp
        // Môi trường Localhost:
        String frontendUrl = "http://localhost:3000";

        // Môi trường Deploy (Khi nào deploy thì mở comment dòng này và comment dòng trên):
        // String frontendUrl = "http://35.186.145.70";

        String verificationUrl = frontendUrl + "/verify?token=" + token;

        String recipientEmail = user.getEmail();
        String subject = "Xác thực tài khoản IOT-SmartStick";
        String messageBody = "Chào " + user.getFullName() + ",\n\n"
                + "Cảm ơn bạn đã đăng ký tài khoản IOT-SmartStick.\n"
                + "Vui lòng click vào đường dẫn dưới đây để kích hoạt tài khoản của bạn:\n\n"
                + verificationUrl + "\n\n"
                + "Link xác thực sẽ hết hạn sau 15 phút.\n\n"
                + "Trân trọng,\n"
                + "Đội ngũ phát triển SmartStick.";

        sendEmail(recipientEmail, subject, messageBody);
    }

    @Override
    public void sendAlertEmail(User user, Device device, Location location, AlertType alertType, String message) {
        if (user == null || user.getEmail() == null) {
            log.warn("Cannot send alert email: User or Email is null");
            return;
        }

        String subject = buildAlertSubject(alertType, device.getName());
        String body = buildAlertBody(user, device, location, alertType, message);

        sendEmail(user.getEmail(), subject, body);
    }

    // --- Private Helper Methods (Clean Code) ---

    private void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            message.setFrom("no-reply@smartstick.com");

            mailSender.send(message);
            log.info("Email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
        }
    }

    private String buildAlertSubject(AlertType type, String deviceName) {
        String prefix = switch (type) {
            case SOS -> "🚨 [KHẨN CẤP] CẢNH BÁO SOS";
            case LOST -> "⚠️ [CẢNH BÁO] THIẾT BỊ MẤT TÍN HIỆU";
            case GEOFENCE_BREACH -> "⛔ [CẢNH BÁO] RA KHỎI VÙNG AN TOÀN";
            case GEOFENCE_RETURN -> "✅ [THÔNG BÁO] TRỞ LẠI VÙNG AN TOÀN";
            default -> "🔔 [THÔNG BÁO]";
        };
        return prefix + ": " + deviceName;
    }

    private String buildAlertBody(User user, Device device, Location location, AlertType type, String customMessage) {
        StringBuilder sb = new StringBuilder();
        sb.append("Chào ").append(user.getFullName()).append(",\n\n");
        sb.append("Hệ thống nhận được cảnh báo từ thiết bị: ").append(device.getName()).append("\n");
        sb.append("Nội dung: ").append(customMessage).append("\n\n");

        if (location != null) {
            String timeStr = location.getTimestamp() != null
                    ? location.getTimestamp().format(DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy"))
                    : "N/A";

            sb.append("🕒 Thời gian: ").append(timeStr).append("\n");
            sb.append("📍 Tọa độ: ").append(location.getLatitude()).append(", ").append(location.getLongitude()).append("\n");

            // Link Google Maps
            sb.append("🗺️ Xem trên bản đồ: https://www.google.com/maps/search/?api=1&query=")
                    .append(location.getLatitude()).append(",").append(location.getLongitude())
                    .append("\n\n");
        }

        sb.append("Vui lòng kiểm tra ứng dụng để biết thêm chi tiết.\n");
        sb.append("Trân trọng,\nĐội ngũ SmartStick.");
        return sb.toString();
    }
}