package com.example.IOT_SmartStick.service.impl;

import com.example.IOT_SmartStick.dto.response.LocationHistoryDTO;
import com.example.IOT_SmartStick.entity.Device;
import com.example.IOT_SmartStick.entity.Location;
import com.example.IOT_SmartStick.entity.User;
import com.example.IOT_SmartStick.exception.ResourceNotFoundException;
import com.example.IOT_SmartStick.repository.DeviceRepository;
import com.example.IOT_SmartStick.repository.LocationRepository;
import com.example.IOT_SmartStick.repository.UserRepository;
import com.example.IOT_SmartStick.service.JwtService;
import com.example.IOT_SmartStick.service.LocationHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocationHistoryServiceImpl implements LocationHistoryService {

    private final LocationRepository locationRepository;
    private final DeviceRepository deviceRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Override
    public LocationHistoryDTO getDeviceHistory(Long deviceId, LocalDateTime startTime, LocalDateTime endTime, String token) {
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Long deviceIdInt = deviceId.longValue();
        Device device = deviceRepository.findById(deviceIdInt)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + deviceId));

        if (device.getOwner() == null) {
            throw new SecurityException("Thiết bị chưa được kích hoạt");
        }

        if (!device.getOwner().getId().equals(user.getId())) {
            throw new SecurityException("Bạn không có quyền xem lịch sử thiết bị này");
        }

        List<Location> locations = locationRepository.findByDeviceIdAndTimestampBetween(
                deviceId,
                startTime,
                endTime
        );

        return buildHistoryDTO(device, locations, startTime, endTime);
    }

    @Override
    public LocationHistoryDTO getDeviceRecentHistory(Long deviceId, int hours, String token) {
        LocalDateTime endTime = LocalDateTime.now();
        LocalDateTime startTime = endTime.minusHours(hours);
        return getDeviceHistory(deviceId, startTime, endTime, token);
    }

    private LocationHistoryDTO buildHistoryDTO(Device device, List<Location> locations,
                                               LocalDateTime startTime, LocalDateTime endTime) {
        List<LocationHistoryDTO.LocationPointDTO> path = locations.stream()
                .map(loc -> LocationHistoryDTO.LocationPointDTO.builder()
                        .lat(loc.getLatitude())
                        .lng(loc.getLongitude())
                        .timestamp(loc.getTimestamp())
                        .build())
                .collect(Collectors.toList());

        return LocationHistoryDTO.builder()
                .deviceId(device.getId())
                .deviceName(device.getName())
                .startTime(startTime)
                .endTime(endTime)
                .totalPoints(path.size())
                .path(path)
                .build();
    }
}