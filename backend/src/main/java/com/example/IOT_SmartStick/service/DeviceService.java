package com.example.IOT_SmartStick.service;

import com.example.IOT_SmartStick.dto.DeviceUpdateDTO;
import com.example.IOT_SmartStick.dto.request.AdminDeviceRequestDTO;
import com.example.IOT_SmartStick.dto.request.ClaimDeviceRequest;
import com.example.IOT_SmartStick.dto.response.DeviceResponseDTO;

import java.util.List;

public interface DeviceService {
    // ========== USER ENDPOINTS ==========

    // User claim device bằng device token
    DeviceResponseDTO claimDevice(ClaimDeviceRequest request, String token);

    // Lấy danh sách device của user (đã claim)
    List<DeviceResponseDTO> getMyDevices(String token);

    // User cập nhật tên device của mình
    DeviceResponseDTO updateMyDevice(Integer id, DeviceUpdateDTO updateDTO, String token);

    // User xóa device khỏi tài khoản (set owner = null)
    void removeDeviceFromAccount(Integer id, String token);

    // ========== ADMIN ENDPOINTS ==========

    // Admin tạo device mới (nhập kho)
    DeviceResponseDTO adminCreateDevice(AdminDeviceRequestDTO request);

    // Admin lấy tất cả devices
    List<DeviceResponseDTO> adminGetAllDevices();

    // Admin cập nhật device (token, name)
    DeviceResponseDTO adminUpdateDevice(Integer id, AdminDeviceRequestDTO request);

    // Admin xóa vĩnh viễn device khỏi DB
    void adminDeleteDevice(Integer id);

    // ========== COMMON ==========
    DeviceResponseDTO getDeviceById(Integer id);
}