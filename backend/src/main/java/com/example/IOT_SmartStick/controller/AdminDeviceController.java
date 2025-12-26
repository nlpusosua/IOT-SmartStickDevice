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
@CrossOrigin(origins = "*")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminDeviceController {

    private final DeviceService deviceService;
    @PostMapping
    public ResponseEntity<DeviceResponseDTO> createDevice(@Valid @RequestBody AdminDeviceRequestDTO request) {
        DeviceResponseDTO response = deviceService.adminCreateDevice(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<DeviceResponseDTO>> getAllDevices() {
        return ResponseEntity.ok(deviceService.adminGetAllDevices());
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeviceResponseDTO> updateDevice(
            @PathVariable Long id,
            @Valid @RequestBody AdminDeviceRequestDTO request) {
        return ResponseEntity.ok(deviceService.adminUpdateDevice(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDevice(@PathVariable Long id) {
        deviceService.adminDeleteDevice(id);
        return ResponseEntity.noContent().build();
    }
}