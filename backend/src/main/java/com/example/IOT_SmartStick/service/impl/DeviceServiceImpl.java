package com.example.IOT_SmartStick.service.impl;

import com.example.IOT_SmartStick.dto.DeviceUpdateDTO;
import com.example.IOT_SmartStick.dto.request.AdminDeviceRequestDTO;
import com.example.IOT_SmartStick.dto.request.DeviceRequestDTO;
import com.example.IOT_SmartStick.dto.response.DeviceResponseDTO;
import com.example.IOT_SmartStick.entity.Device;
import com.example.IOT_SmartStick.entity.User;
import com.example.IOT_SmartStick.exception.DuplicateResourceException;
import com.example.IOT_SmartStick.exception.ResourceNotFoundException;
import com.example.IOT_SmartStick.repository.DeviceRepository;
import com.example.IOT_SmartStick.repository.UserRepository;
import com.example.IOT_SmartStick.service.DeviceService;
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

    @Override
    @Transactional
    public DeviceResponseDTO createDevice(DeviceRequestDTO requestDTO, Integer ownerId) {
        // 1. Tìm User
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + ownerId));

        // 2. Tìm thiết bị dựa trên Device Token (Token người dùng nhập vào)
        Device device = deviceRepository.findByDeviceToken(requestDTO.getDeviceToken())
                .orElseThrow(() -> new ResourceNotFoundException("Mã thiết bị không hợp lệ hoặc không tồn tại trong hệ thống!"));

        // 3. Kiểm tra xem thiết bị này đã có chủ chưa
        if (device.getOwner() != null) {
            throw new DuplicateResourceException("Thiết bị này đã được kích hoạt bởi người khác!");
        }

        // 4. Nếu hợp lệ (Có trong DB và chưa có chủ) -> Cập nhật thông tin
        device.setOwner(owner); // Gán chủ sở hữu
        device.setName(requestDTO.getName()); // Đặt tên gợi nhớ (VD: Gậy của Ông)
        device.setCreatedAt(LocalDateTime.now()); // Cập nhật lại ngày kích hoạt nếu muốn

        // 5. Lưu lại
        Device savedDevice = deviceRepository.save(device);
        return convertToResponseDTO(savedDevice);
    }
    @Override
    public DeviceResponseDTO getDeviceById(Integer id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Device not found with id: "+ id));
        return convertToResponseDTO(device);
    }

    @Override
    public List<DeviceResponseDTO> getAllDevices() {
        return deviceRepository.findAll().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<DeviceResponseDTO> getDevicesByOwnerId(Integer ownerId) {
        if (!userRepository.existsById(ownerId)){
            throw new ResourceNotFoundException("User not found with id: " + ownerId);
        }
        return deviceRepository.findByOwnerId(ownerId).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DeviceResponseDTO updateDevice(Integer id, DeviceUpdateDTO updateDTO) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Device not found with id: " + id));
        if (updateDTO.getName() != null && !updateDTO.getName().isBlank()){
            device.setName(updateDTO.getName());
        }
        if (updateDTO.getDeviceToken() != null && !updateDTO.getDeviceToken().isBlank()){
            if (!device.getDeviceToken().equals(updateDTO.getDeviceToken()) && deviceRepository.existsByDeviceToken(updateDTO.getDeviceToken())){
                throw new DuplicateResourceException("Device token already exists: " + updateDTO.getDeviceToken());
            }
            device.setDeviceToken(updateDTO.getDeviceToken());
        }
        Device updatedDevice = deviceRepository.save(device);
        return convertToResponseDTO(updatedDevice);
    }

    @Override
    public void deleteDevice(Integer id) {
        if (!deviceRepository.existsById(id)){
            throw new ResourceNotFoundException("Device not found with id: " + id);
        }
        deviceRepository.deleteById(id);
    }


    // ================== PHẦN MỚI CHO ADMIN (CRUD) ==================
    @Override
    @Transactional
    public DeviceResponseDTO adminCreateDevice(AdminDeviceRequestDTO request) {
        // 1. Check trùng token
        if (deviceRepository.existsByDeviceToken(request.getDeviceToken())) {
            throw new DuplicateResourceException("Token đã tồn tại: " + request.getDeviceToken());
        }

        // 2. Tạo thiết bị rỗng (Chưa có chủ)
        Device device = Device.builder()
                .deviceToken(request.getDeviceToken())
                .name(request.getName() != null && !request.getName().isBlank() ? request.getName() : "New Device") // Tên mặc định
                .owner(null) // QUAN TRỌNG: Chưa có chủ
                .createdAt(LocalDateTime.now())
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
    public void adminDeleteDevice(Integer id) {
        if (!deviceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Device not found with id: " + id);
        }
        // Xóa vĩnh viễn khỏi DB
        deviceRepository.deleteById(id);
    }
    private DeviceResponseDTO convertToResponseDTO(Device device) {
        // SỬA: Kiểm tra null owner để tránh lỗi NullPointerException
        Integer ownerId = (device.getOwner() != null) ? device.getOwner().getId() : null;
        String ownerName = (device.getOwner() != null) ? device.getOwner().getFullName() : "Chưa kích hoạt";

        return DeviceResponseDTO.builder()
                .id(device.getId())
                .name(device.getName())
                .deviceToken(device.getDeviceToken())
                .createdAt(device.getCreatedAt())
                .ownerId(ownerId)     // Có thể null
                .ownerName(ownerName) // Có thể là "Chưa kích hoạt"
                .build();
    }
}
