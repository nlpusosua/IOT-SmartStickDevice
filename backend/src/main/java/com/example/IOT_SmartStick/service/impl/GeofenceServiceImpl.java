package com.example.IOT_SmartStick.service.impl;

import com.example.IOT_SmartStick.dto.request.GeofenceRequestDTO;
import com.example.IOT_SmartStick.dto.response.GeofenceResponseDTO;
import com.example.IOT_SmartStick.entity.Device;
import com.example.IOT_SmartStick.entity.Geofence;
import com.example.IOT_SmartStick.entity.User;
import com.example.IOT_SmartStick.exception.ResourceNotFoundException;
import com.example.IOT_SmartStick.repository.DeviceRepository;
import com.example.IOT_SmartStick.repository.GeofenceRepository;
import com.example.IOT_SmartStick.repository.UserRepository;
import com.example.IOT_SmartStick.service.GeofenceService;
import com.example.IOT_SmartStick.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeofenceServiceImpl implements GeofenceService {

    private final GeofenceRepository geofenceRepository;
    private final DeviceRepository deviceRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Override
    @Transactional
    public GeofenceResponseDTO createGeofence(Long deviceId, GeofenceRequestDTO request, String token) {
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));

        if (device.getOwner() == null || !device.getOwner().getId().equals(user.getId())) {
            throw new SecurityException("Bạn không có quyền tạo geofence cho thiết bị này");
        }

        Geofence geofence = Geofence.builder()
                .name(request.getName())
                .centerLatitude(request.getCenterLatitude())
                .centerLongitude(request.getCenterLongitude())
                .radiusMeters(request.getRadiusMeters())
                .active(request.getActive() != null ? request.getActive() : true)
                .device(device)
                .build();

        Geofence saved = geofenceRepository.save(geofence);
        log.info("✅ Created geofence: {} for device: {}", saved.getName(), device.getName());

        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public GeofenceResponseDTO updateGeofence(Long geofenceId, GeofenceRequestDTO request, String token) {
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Geofence geofence = geofenceRepository.findByIdAndDeviceOwnerId(geofenceId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Geofence not found or access denied"));

        geofence.setName(request.getName());
        geofence.setCenterLatitude(request.getCenterLatitude());
        geofence.setCenterLongitude(request.getCenterLongitude());
        geofence.setRadiusMeters(request.getRadiusMeters());
        if (request.getActive() != null) {
            geofence.setActive(request.getActive());
        }

        Geofence updated = geofenceRepository.save(geofence);
        log.info("🔄 Updated geofence: {}", updated.getName());

        return convertToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteGeofence(Long geofenceId, String token) {
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Geofence geofence = geofenceRepository.findByIdAndDeviceOwnerId(geofenceId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Geofence not found or access denied"));

        geofenceRepository.delete(geofence);
        log.info("🗑️ Deleted geofence: {}", geofence.getName());
    }

    @Override
    public GeofenceResponseDTO getGeofenceById(Long geofenceId, String token) {
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Geofence geofence = geofenceRepository.findByIdAndDeviceOwnerId(geofenceId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Geofence not found or access denied"));

        return convertToDTO(geofence);
    }

    @Override
    public List<GeofenceResponseDTO> getGeofencesByDevice(Long deviceId, String token) {
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));

        if (device.getOwner() == null || !device.getOwner().getId().equals(user.getId())) {
            throw new SecurityException("Bạn không có quyền xem geofence của thiết bị này");
        }

        List<Geofence> geofences = geofenceRepository.findByDeviceId(deviceId);
        return geofences.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public GeofenceResponseDTO toggleGeofenceStatus(Long geofenceId, String token) {
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Geofence geofence = geofenceRepository.findByIdAndDeviceOwnerId(geofenceId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Geofence not found or access denied"));

        geofence.setActive(!geofence.getActive());
        Geofence updated = geofenceRepository.save(geofence);

        log.info("🔘 Toggled geofence status: {} -> {}", updated.getName(), updated.getActive());

        return convertToDTO(updated);
    }

    private GeofenceResponseDTO convertToDTO(Geofence geofence) {
        return GeofenceResponseDTO.builder()
                .id(geofence.getId())
                .name(geofence.getName())
                .centerLatitude(geofence.getCenterLatitude())
                .centerLongitude(geofence.getCenterLongitude())
                .radiusMeters(geofence.getRadiusMeters())
                .active(geofence.getActive())
                .deviceId(geofence.getDevice().getId())
                .deviceName(geofence.getDevice().getName())
                .createdAt(geofence.getCreatedAt())
                .updatedAt(geofence.getUpdatedAt())
                .build();
    }
}