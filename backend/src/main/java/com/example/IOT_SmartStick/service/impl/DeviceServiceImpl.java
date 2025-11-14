package com.example.IOT_SmartStick.service.impl;

import com.example.IOT_SmartStick.dto.DeviceUpdateDTO;
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

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeviceServiceImpl implements DeviceService {
    private final DeviceRepository deviceRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public DeviceResponseDTO createDevice(DeviceRequestDTO requestDTO, Integer ownerId){
        User owner = userRepository.findById(ownerId)
                .orElseThrow(()-> new ResourceNotFoundException("User not found with id: " + ownerId));

        if (deviceRepository.existsByDeviceToken(requestDTO.getDeviceToken())){
            throw new DuplicateResourceException("Device token already exists: "+ requestDTO.getDeviceToken());
        }

        Device device = Device.builder()
                .name(requestDTO.getName())
                .deviceToken(requestDTO.getDeviceToken())
                .owner(owner)
                .build();

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

    private DeviceResponseDTO convertToResponseDTO(Device device) {
        return DeviceResponseDTO.builder()
                .id(device.getId())
                .name(device.getName())
                .deviceToken(device.getDeviceToken())
                .createdAt(device.getCreatedAt())
                .ownerId(device.getOwner().getId())
                .ownerName(device.getOwner().getFullName()) // Giả sử User có username
                .build();
    }
}
