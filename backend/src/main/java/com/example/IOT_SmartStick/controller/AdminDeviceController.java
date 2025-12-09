package com.example.IOT_SmartStick.controller;

import com.example.IOT_SmartStick.dto.request.AdminDeviceRequestDTO;
import com.example.IOT_SmartStick.dto.response.DeviceResponseDTO;
import com.example.IOT_SmartStick.service.DeviceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/devices")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
// Yêu cầu Role ADMIN cho toàn bộ controller này
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminDeviceController {

    private final DeviceService deviceService;

    /**
     * Admin tạo mới thiết bị (Nhập kho)
     * Body: { "deviceToken": "ABC123", "name": "Device Name" }
     */
    @PostMapping
    public ResponseEntity<DeviceResponseDTO> createDevice(@Valid @RequestBody AdminDeviceRequestDTO request) {
        DeviceResponseDTO response = deviceService.adminCreateDevice(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Admin xem danh sách toàn bộ thiết bị (kể cả đã có chủ và chưa có chủ)
     */
    @GetMapping
    public ResponseEntity<List<DeviceResponseDTO>> getAllDevices() {
        return ResponseEntity.ok(deviceService.adminGetAllDevices());
    }

    /**
     * Admin sửa thông tin thiết bị (Sửa token sai, đổi tên)
     */
    @PutMapping("/{id}")
    public ResponseEntity<DeviceResponseDTO> updateDevice(
            @PathVariable Integer id,
            @Valid @RequestBody AdminDeviceRequestDTO request) {
        return ResponseEntity.ok(deviceService.adminUpdateDevice(id, request));
    }

    /**
     * Admin xóa thiết bị (Xóa khỏi kho - vĩnh viễn)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDevice(@PathVariable Integer id) {
        deviceService.adminDeleteDevice(id);
        return ResponseEntity.noContent().build();
    }
}