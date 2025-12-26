package com.example.IOT_SmartStick.service.impl;

import com.example.IOT_SmartStick.constant.DeviceStatus;
import com.example.IOT_SmartStick.dto.DeviceUpdateDTO;
import com.example.IOT_SmartStick.dto.request.AdminDeviceRequestDTO;
import com.example.IOT_SmartStick.dto.request.ClaimDeviceRequest;
import com.example.IOT_SmartStick.dto.response.DeviceResponseDTO;
import com.example.IOT_SmartStick.entity.Device;
import com.example.IOT_SmartStick.entity.User;
import com.example.IOT_SmartStick.exception.DuplicateResourceException;
import com.example.IOT_SmartStick.exception.ResourceNotFoundException;
import com.example.IOT_SmartStick.repository.DeviceRepository;
import com.example.IOT_SmartStick.repository.LocationRepository;
import com.example.IOT_SmartStick.repository.UserRepository;
import com.example.IOT_SmartStick.service.DeviceService;
import com.example.IOT_SmartStick.service.JwtService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeviceServiceImpl implements DeviceService {
    private final DeviceRepository deviceRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final LocationRepository locationRepository;

    // ==================== USER METHODS ====================
    @Override
    @Transactional
    public DeviceResponseDTO claimDevice(ClaimDeviceRequest request, String token) {
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Device device = deviceRepository.findByDeviceToken(request.getDeviceToken())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy thiết bị với mã: " + request.getDeviceToken()));

        if (device.getOwner() != null) {
            throw new IllegalStateException("Thiết bị này đã được kích hoạt bởi người dùng khác");
        }

        device.setOwner(user);
        device.setName(request.getName());

        Device savedDevice = deviceRepository.save(device);
        return convertToResponseDTO(savedDevice);
    }

    @Override
    public List<DeviceResponseDTO> getMyDevices(String token) {
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return deviceRepository.findByOwnerId(user.getId()).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DeviceResponseDTO updateMyDevice(Long id, DeviceUpdateDTO updateDTO, String token) {
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + id));

        if (device.getOwner() == null || !device.getOwner().getId().equals(user.getId())) {
            throw new SecurityException("Bạn không có quyền chỉnh sửa thiết bị này");
        }

        if (updateDTO.getName() != null && !updateDTO.getName().isBlank()) {
            device.setName(updateDTO.getName());
        }

        Device updatedDevice = deviceRepository.save(device);
        return convertToResponseDTO(updatedDevice);
    }

    @Override
    @Transactional
    public void removeDeviceFromAccount(Long id, String token) {
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + id));

        if (device.getOwner() == null || !device.getOwner().getId().equals(user.getId())) {
            throw new SecurityException("Bạn không có quyền xóa thiết bị này");
        }

        device.setOwner(null);
        device.setName("Unclaimed Device");
        deviceRepository.save(device);
    }
    // ==================== ADMIN METHODS ====================

    @Override
    @Transactional
    public DeviceResponseDTO adminCreateDevice(AdminDeviceRequestDTO request) {
        if (deviceRepository.existsByDeviceToken(request.getDeviceToken())) {
            throw new DuplicateResourceException("Token đã tồn tại: " + request.getDeviceToken());
        }

        Device device = Device.builder()
                .deviceToken(request.getDeviceToken())
                .name(request.getName() != null && !request.getName().isBlank()
                        ? request.getName()
                        : "New Device")
                .owner(null)
                .status(DeviceStatus.OFFLINE)
                .build();

        return convertToResponseDTO(deviceRepository.save(device));
    }

    @Override
    public List<DeviceResponseDTO> adminGetAllDevices() {
        return deviceRepository.findAll().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DeviceResponseDTO adminUpdateDevice(Long id, AdminDeviceRequestDTO request) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + id));

        if (request.getDeviceToken() != null && !request.getDeviceToken().isBlank()) {
            if (!device.getDeviceToken().equals(request.getDeviceToken())
                    && deviceRepository.existsByDeviceToken(request.getDeviceToken())) {
                throw new DuplicateResourceException("Token đã tồn tại: " + request.getDeviceToken());
            }
            device.setDeviceToken(request.getDeviceToken());
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            device.setName(request.getName());
        }
        return convertToResponseDTO(deviceRepository.save(device));
    }

    @Override
    @Transactional
    public void adminDeleteDevice(Long id) {
        if (!deviceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Device not found with id: " + id);
        }
        deviceRepository.deleteById(id);
    }

    // ==================== COMMON METHODS ====================

    @Override
    public DeviceResponseDTO getDeviceById(Long id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + id));
        return convertToResponseDTO(device);
    }


    // ==================== HELPER METHODS ====================
    private DeviceResponseDTO convertToResponseDTO(Device device) {
        Integer ownerId = (device.getOwner() != null) ? device.getOwner().getId() : null;
        String ownerName = (device.getOwner() != null) ? device.getOwner().getFullName() : "Chưa kích hoạt";

        DeviceResponseDTO.LocationDTO location = null;
        if (device.getLastLatitude() != null && device.getLastLongitude() != null) {
            location = DeviceResponseDTO.LocationDTO.builder()
                    .lat(device.getLastLatitude())
                    .lng(device.getLastLongitude())
                    .build();
        }

        return DeviceResponseDTO.builder()
                .id(device.getId())
                .name(device.getName())
                .deviceToken(device.getDeviceToken())
                .status(device.getStatus())
                .createdAt(device.getCreatedAt())
                .lastUpdate(device.getLastUpdate())
                .ownerId(ownerId)
                .ownerName(ownerName)
                .location(location)
                .sos(false)
                .geofence("INSIDE")
                .build();
    }
}