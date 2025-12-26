package com.example.IOT_SmartStick.controller;

import com.example.IOT_SmartStick.dto.DeviceUpdateDTO;
import com.example.IOT_SmartStick.dto.request.ClaimDeviceRequest;
import com.example.IOT_SmartStick.dto.response.DeviceResponseDTO;
import com.example.IOT_SmartStick.dto.response.LocationHistoryDTO;
import com.example.IOT_SmartStick.dto.sendSignal.IngestLocationRequest;
import com.example.IOT_SmartStick.exception.ResourceNotFoundException;
import com.example.IOT_SmartStick.service.DeviceService;
import com.example.IOT_SmartStick.service.IngestService;
import com.example.IOT_SmartStick.service.LocationHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/device")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DeviceController {
    private final DeviceService deviceService;
    private final LocationHistoryService locationHistoryService;
    @Autowired
    private IngestService ingestService;

    @PostMapping("/location")
    public ResponseEntity<String> receiveLocation(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody IngestLocationRequest payload) {
        try {
            ingestService.ingestDeviceData(authHeader, payload);
            return ResponseEntity.ok("Data received successfully");
        } catch (SecurityException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }
    @PostMapping("/claim")
    public ResponseEntity<?> claimDevice(
            @Valid @RequestBody ClaimDeviceRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            DeviceResponseDTO response = deviceService.claimDevice(request, token);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException | ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Có lỗi xảy ra: " + e.getMessage());
        }
    }


    @GetMapping("/my-devices")
    public ResponseEntity<?> getMyDevices(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            List<DeviceResponseDTO> devices = deviceService.getMyDevices(token);
            return ResponseEntity.ok(devices);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMyDevice(
            @PathVariable Long id,
            @RequestBody DeviceUpdateDTO updateDTO,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            DeviceResponseDTO response = deviceService.updateMyDevice(id, updateDTO, token);
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeDevice(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            deviceService.removeDeviceFromAccount(id, token);
            return ResponseEntity.ok("Đã xóa thiết bị khỏi tài khoản");
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeviceResponseDTO> getDeviceById(@PathVariable Long id) {
        DeviceResponseDTO response = deviceService.getDeviceById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<?> getDeviceHistory(
            @PathVariable Long id,
            @RequestParam(defaultValue = "24") int hours,
            @RequestHeader("Authorization") String authHeader) {
        try {

            String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

            LocationHistoryDTO history = locationHistoryService.getDeviceRecentHistory(id, hours, token);

            return ResponseEntity.ok(history);

        } catch (SecurityException e) {

            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (ResourceNotFoundException e) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi server: " + e.getMessage());
        }
    }
}