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
@CrossOrigin(origins = "*")
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    public ResponseEntity<List<AlertResponseDTO>> getMyAlerts(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        List<AlertResponseDTO> alerts = alertService.getMyAlerts(token);
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<AlertResponseDTO>> getUnreadAlerts(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        List<AlertResponseDTO> alerts = alertService.getUnreadAlerts(token);
        return ResponseEntity.ok(alerts);
    }

    @PatchMapping("/{alertId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long alertId,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        alertService.markAsRead(alertId, token);
        return ResponseEntity.ok().build();
    }


    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        alertService.markAllAsRead(token);
        return ResponseEntity.ok().build();
    }
}