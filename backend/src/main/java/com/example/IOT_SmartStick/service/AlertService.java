package com.example.IOT_SmartStick.service;

import com.example.IOT_SmartStick.dto.response.AlertResponseDTO;
import com.example.IOT_SmartStick.entity.Alert;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public interface AlertService {
    List<AlertResponseDTO> getMyAlerts(String token);
    List<AlertResponseDTO> getUnreadAlerts(String token);
    void markAsRead(Long alertId, String token);
    void markAllAsRead(String token);
    void createAlert(Alert alert);
}