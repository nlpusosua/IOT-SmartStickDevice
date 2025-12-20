package com.example.IOT_SmartStick.controller;

import com.example.IOT_SmartStick.dto.response.ChartDataDTO;
import com.example.IOT_SmartStick.dto.response.DashboardStatsDTO;
import com.example.IOT_SmartStick.dto.response.UserResponseDTO;
import com.example.IOT_SmartStick.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // --- User Management ---
    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PatchMapping("/users/{id}/ban")
    public ResponseEntity<Void> banUser(@PathVariable Integer id) {
        adminService.banUser(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/users/{id}/unban")
    public ResponseEntity<Void> unbanUser(@PathVariable Integer id) {
        adminService.unbanUser(id);
        return ResponseEntity.ok().build();
    }

    // --- Statistics ---
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }
    @GetMapping("/stats/user-growth")
    public ResponseEntity<List<ChartDataDTO>> getUserGrowthStats() {
        return ResponseEntity.ok(adminService.getUserGrowthStats());
    }

    @GetMapping("/stats/device-status")
    public ResponseEntity<List<ChartDataDTO>> getDeviceStatusStats() {
        return ResponseEntity.ok(adminService.getDeviceStatusStats());
    }
}