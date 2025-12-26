package com.example.IOT_SmartStick.service;

import com.example.IOT_SmartStick.dto.DeviceUpdateDTO;
import com.example.IOT_SmartStick.dto.request.AdminDeviceRequestDTO;
import com.example.IOT_SmartStick.dto.request.ClaimDeviceRequest;
import com.example.IOT_SmartStick.dto.response.DeviceResponseDTO;

import java.util.List;

public interface DeviceService {
    // ========== USER ENDPOINTS ==========

    DeviceResponseDTO claimDevice(ClaimDeviceRequest request, String token);

    List<DeviceResponseDTO> getMyDevices(String token);

    DeviceResponseDTO updateMyDevice(Long id, DeviceUpdateDTO updateDTO, String token);

    void removeDeviceFromAccount(Long id, String token);

    // ========== ADMIN ENDPOINTS ==========

    DeviceResponseDTO adminCreateDevice(AdminDeviceRequestDTO request);

    List<DeviceResponseDTO> adminGetAllDevices();

    DeviceResponseDTO adminUpdateDevice(Long id, AdminDeviceRequestDTO request);

    void adminDeleteDevice(Long id);

    // ========== COMMON ==========
    DeviceResponseDTO getDeviceById(Long id);


}