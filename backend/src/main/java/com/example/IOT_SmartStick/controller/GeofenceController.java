package com.example.IOT_SmartStick.controller;

import com.example.IOT_SmartStick.dto.request.GeofenceRequestDTO;
import com.example.IOT_SmartStick.dto.response.GeofenceResponseDTO;
import com.example.IOT_SmartStick.service.GeofenceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/geofence")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GeofenceController {

    private final GeofenceService geofenceService;

    @PostMapping("/device/{deviceId}")
    public ResponseEntity<GeofenceResponseDTO> createGeofence(
            @PathVariable Long deviceId,
            @Valid @RequestBody GeofenceRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        GeofenceResponseDTO response = geofenceService.createGeofence(deviceId, request, token);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/device/{deviceId}")
    public ResponseEntity<List<GeofenceResponseDTO>> getGeofencesByDevice(
            @PathVariable Long deviceId,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        List<GeofenceResponseDTO> geofences = geofenceService.getGeofencesByDevice(deviceId, token);
        return ResponseEntity.ok(geofences);
    }

    @GetMapping("/{geofenceId}")
    public ResponseEntity<GeofenceResponseDTO> getGeofenceById(
            @PathVariable Long geofenceId,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        GeofenceResponseDTO response = geofenceService.getGeofenceById(geofenceId, token);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{geofenceId}")
    public ResponseEntity<GeofenceResponseDTO> updateGeofence(
            @PathVariable Long geofenceId,
            @Valid @RequestBody GeofenceRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        GeofenceResponseDTO response = geofenceService.updateGeofence(geofenceId, request, token);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{geofenceId}/toggle")
    public ResponseEntity<GeofenceResponseDTO> toggleGeofenceStatus(
            @PathVariable Long geofenceId,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        GeofenceResponseDTO response = geofenceService.toggleGeofenceStatus(geofenceId, token);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{geofenceId}")
    public ResponseEntity<Void> deleteGeofence(
            @PathVariable Long geofenceId,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        geofenceService.deleteGeofence(geofenceId, token);
        return ResponseEntity.noContent().build();
    }
}