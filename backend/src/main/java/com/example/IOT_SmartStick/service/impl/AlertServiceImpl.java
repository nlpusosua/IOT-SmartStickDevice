package com.example.IOT_SmartStick.service.impl;

import com.example.IOT_SmartStick.dto.response.AlertResponseDTO;
import com.example.IOT_SmartStick.entity.Alert;
import com.example.IOT_SmartStick.entity.User;
import com.example.IOT_SmartStick.exception.ResourceNotFoundException;
import com.example.IOT_SmartStick.repository.AlertRepository;
import com.example.IOT_SmartStick.repository.UserRepository;
import com.example.IOT_SmartStick.service.AlertService;
import com.example.IOT_SmartStick.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlertServiceImpl implements AlertService {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    // Inject WebSocket template
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public List<AlertResponseDTO> getMyAlerts(String token) {
        Integer userId = getUserIdFromToken(token);
        List<Alert> alerts = alertRepository.findByUserId(userId);
        return alerts.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<AlertResponseDTO> getUnreadAlerts(String token) {
        Integer userId = getUserIdFromToken(token);
        List<Alert> alerts = alertRepository.findUnreadByUserId(userId);
        return alerts.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAsRead(Long alertId, String token) {
        Integer userId = getUserIdFromToken(token);
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found"));

        // SỬA: Lấy owner thông qua device
        if (alert.getDevice().getOwner() == null ||
                !alert.getDevice().getOwner().getId().equals(userId)) {
            throw new SecurityException("Bạn không có quyền đánh dấu alert này");
        }

        alert.setIsRead(true);
        alertRepository.save(alert);
    }

    @Override
    @Transactional
    public void markAllAsRead(String token) {
        Integer userId = getUserIdFromToken(token);
        List<Alert> unreadAlerts = alertRepository.findUnreadByUserId(userId);
        unreadAlerts.forEach(alert -> alert.setIsRead(true));
        alertRepository.saveAll(unreadAlerts);
    }

    // --- PHẦN QUAN TRỌNG NHẤT CẦN SỬA ---
    @Override
    @Transactional
    public void createAlert(Alert alert) {
        // 1. Lưu vào Database
        Alert savedAlert = alertRepository.save(alert);

        // 2. Kiểm tra xem thiết bị có chủ sở hữu không
        if (savedAlert.getDevice() != null && savedAlert.getDevice().getOwner() != null) {
            // SỬA LỖI Ở ĐÂY: Lấy ID từ Device Owner
            Integer userId = savedAlert.getDevice().getOwner().getId();

            // 3. Convert dữ liệu sang DTO để gửi xuống Frontend
            AlertResponseDTO responseDTO = convertToDTO(savedAlert);

            // 4. Gửi WebSocket đến đúng topic user đang nghe
            // Topic: /topic/user/{userId}/alerts
            messagingTemplate.convertAndSend("/topic/user/" + userId + "/alerts", responseDTO);

            System.out.println("✅ Đã gửi WebSocket tới user: " + userId);
        } else {
            System.out.println("⚠️ Alert được tạo nhưng Device không có Owner, không gửi WebSocket.");
        }
    }

    private Integer getUserIdFromToken(String token) {
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }

    private AlertResponseDTO convertToDTO(Alert alert) {
        return AlertResponseDTO.builder()
                .id(Long.valueOf(alert.getId()))
                .alertType(alert.getAlertType())
                .message(alert.getMessage())
                .timestamp(alert.getTimestamp())
                .isRead(alert.getIsRead())
                .deviceId(alert.getDevice().getId())
                .deviceName(alert.getDevice().getName())
                // Location có thể null nếu cảnh báo Geofence không kèm tọa độ
                .latitude(alert.getLocation() != null ? alert.getLocation().getLatitude() : null)
                .longitude(alert.getLocation() != null ? alert.getLocation().getLongitude() : null)
                .build();
    }
}