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
import com.example.IOT_SmartStick.repository.UserRepository;
import com.example.IOT_SmartStick.service.DeviceService;
import com.example.IOT_SmartStick.service.JwtService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeviceServiceImpl implements DeviceService {
    private final DeviceRepository deviceRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    // ==================== USER METHODS ====================

    @Override
    @Transactional
    public DeviceResponseDTO claimDevice(ClaimDeviceRequest request, String token) {
        // Lấy thông tin user từ token
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Tìm device theo token
        Device device = deviceRepository.findByDeviceToken(request.getDeviceToken())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy thiết bị với mã: " + request.getDeviceToken()));

        // Kiểm tra device đã có chủ chưa
        if (device.getOwner() != null) {
            throw new IllegalStateException("Thiết bị này đã được kích hoạt bởi người dùng khác");
        }

        // Gán owner và đặt tên
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
    public DeviceResponseDTO updateMyDevice(Integer id, DeviceUpdateDTO updateDTO, String token) {
        // Lấy thông tin user
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Tìm device
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + id));

        // Kiểm tra quyền sở hữu
        if (device.getOwner() == null || !device.getOwner().getId().equals(user.getId())) {
            throw new SecurityException("Bạn không có quyền chỉnh sửa thiết bị này");
        }

        // Chỉ cho phép sửa tên
        if (updateDTO.getName() != null && !updateDTO.getName().isBlank()) {
            device.setName(updateDTO.getName());
        }

        Device updatedDevice = deviceRepository.save(device);
        return convertToResponseDTO(updatedDevice);
    }

    @Override
    @Transactional
    public void removeDeviceFromAccount(Integer id, String token) {
        // Lấy thông tin user
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Tìm device
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + id));

        // Kiểm tra quyền sở hữu
        if (device.getOwner() == null || !device.getOwner().getId().equals(user.getId())) {
            throw new SecurityException("Bạn không có quyền xóa thiết bị này");
        }

        // Set owner = null (trả device về kho)
        device.setOwner(null);
        device.setName("Unclaimed Device"); // Đặt lại tên mặc định
        deviceRepository.save(device);
    }

    // ==================== ADMIN METHODS ====================

    @Override
    @Transactional
    public DeviceResponseDTO adminCreateDevice(AdminDeviceRequestDTO request) {
        // Kiểm tra trùng token
        if (deviceRepository.existsByDeviceToken(request.getDeviceToken())) {
            throw new DuplicateResourceException("Token đã tồn tại: " + request.getDeviceToken());
        }

        // Tạo thiết bị rỗng (chưa có chủ)
        Device device = Device.builder()
                .deviceToken(request.getDeviceToken())
                .name(request.getName() != null && !request.getName().isBlank()
                        ? request.getName()
                        : "New Device") // Tên mặc định
                .owner(null) // QUAN TRỌNG: Chưa có chủ
                .status(DeviceStatus.OFFLINE) // Mặc định offline
                .build();

        return convertToResponseDTO(deviceRepository.save(device));
    }

    @Override
    public List<DeviceResponseDTO> adminGetAllDevices() {
        // Lấy tất cả thiết bị trong kho (kể cả đã có chủ hoặc chưa)
        return deviceRepository.findAll().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DeviceResponseDTO adminUpdateDevice(Integer id, AdminDeviceRequestDTO request) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + id));

        // Update Token (nếu thay đổi thì phải check trùng)
        if (request.getDeviceToken() != null && !request.getDeviceToken().isBlank()) {
            if (!device.getDeviceToken().equals(request.getDeviceToken())
                    && deviceRepository.existsByDeviceToken(request.getDeviceToken())) {
                throw new DuplicateResourceException("Token đã tồn tại: " + request.getDeviceToken());
            }
            device.setDeviceToken(request.getDeviceToken());
        }

        // Update Name
        if (request.getName() != null && !request.getName().isBlank()) {
            device.setName(request.getName());
        }

        return convertToResponseDTO(deviceRepository.save(device));
    }

    @Override
    @Transactional
    public void adminDeleteDevice(Integer id) {
        if (!deviceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Device not found with id: " + id);
        }
        // Xóa vĩnh viễn khỏi DB
        deviceRepository.deleteById(id);
    }

    // ==================== COMMON METHODS ====================

    @Override
    public DeviceResponseDTO getDeviceById(Integer id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + id));
        return convertToResponseDTO(device);
    }

    // ==================== HELPER METHODS ====================

    private DeviceResponseDTO convertToResponseDTO(Device device) {
        // Kiểm tra null owner để tránh lỗi NullPointerException
        Integer ownerId = (device.getOwner() != null) ? device.getOwner().getId() : null;
        String ownerName = (device.getOwner() != null) ? device.getOwner().getFullName() : "Chưa kích hoạt";

        return DeviceResponseDTO.builder()
                .id(device.getId())
                .name(device.getName())
                .deviceToken(device.getDeviceToken())
                .status(device.getStatus())
                .createdAt(device.getCreatedAt())
                .lastUpdate(device.getLastUpdate())
                .ownerId(ownerId)
                .ownerName(ownerName)
                .build();
    }
}