package com.example.IOT_SmartStick.controller;
import com.example.IOT_SmartStick.dto.response.AlertResponseDTO;
import com.example.IOT_SmartStick.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AlertController {

    private final AlertService alertService;

    /**
     * Lấy tất cả alerts của user
     */
    @GetMapping
    public ResponseEntity<List<AlertResponseDTO>> getMyAlerts(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        List<AlertResponseDTO> alerts = alertService.getMyAlerts(token);
        return ResponseEntity.ok(alerts);
    }

    /**
     * Lấy alerts chưa đọc
     */
    @GetMapping("/unread")
    public ResponseEntity<List<AlertResponseDTO>> getUnreadAlerts(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        List<AlertResponseDTO> alerts = alertService.getUnreadAlerts(token);
        return ResponseEntity.ok(alerts);
    }

    /**
     * Đánh dấu alert đã đọc
     */
    @PatchMapping("/{alertId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long alertId,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        alertService.markAsRead(alertId, token);
        return ResponseEntity.ok().build();
    }

    /**
     * Đánh dấu tất cả alerts đã đọc
     */
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        alertService.markAllAsRead(token);
        return ResponseEntity.ok().build();
    }
}