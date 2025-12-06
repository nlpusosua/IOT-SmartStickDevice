package com.example.IOT_SmartStick.service;


import com.example.IOT_SmartStick.dto.DeviceUpdateDTO;
import com.example.IOT_SmartStick.dto.request.AdminDeviceRequestDTO;
import com.example.IOT_SmartStick.dto.request.DeviceRequestDTO;
import com.example.IOT_SmartStick.dto.response.DeviceResponseDTO;

import java.util.List;

public interface DeviceService {
    DeviceResponseDTO createDevice(DeviceRequestDTO requestDTO, Integer ownerId);

    DeviceResponseDTO getDeviceById(Integer id);

    List<DeviceResponseDTO> getAllDevices();

    List<DeviceResponseDTO> getDevicesByOwnerId(Integer ownerId);

    DeviceResponseDTO updateDevice(Integer id, DeviceUpdateDTO updateDTO);

    void deleteDevice(Integer id);
    // --- PHẦN MỚI CHO ADMIN (CRUD KHO) ---
    DeviceResponseDTO adminCreateDevice(AdminDeviceRequestDTO request);
    List<DeviceResponseDTO> adminGetAllDevices();
    DeviceResponseDTO adminUpdateDevice(Integer id, AdminDeviceRequestDTO request);
    void adminDeleteDevice(Integer id); // Admin xóa vĩnh viễn thiết bị khỏi DB
}