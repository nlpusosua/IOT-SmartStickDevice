package com.example.IOT_SmartStick.service.impl;

import com.example.IOT_SmartStick.constant.DeviceStatus;
import com.example.IOT_SmartStick.constant.UserStatus;
import com.example.IOT_SmartStick.dto.response.DashboardStatsDTO;
import com.example.IOT_SmartStick.dto.response.UserResponseDTO;
import com.example.IOT_SmartStick.entity.Device;
import com.example.IOT_SmartStick.entity.User;
import com.example.IOT_SmartStick.exception.ResourceNotFoundException;
import com.example.IOT_SmartStick.repository.AlertRepository;
import com.example.IOT_SmartStick.repository.DeviceRepository;
import com.example.IOT_SmartStick.repository.UserRepository;
import com.example.IOT_SmartStick.repository.VerificationTokenRepository;
import com.example.IOT_SmartStick.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.IOT_SmartStick.dto.response.ChartDataDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.ArrayList;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final DeviceRepository deviceRepository;
    private final AlertRepository alertRepository;
    private final VerificationTokenRepository tokenRepository;
    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    @Override
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> UserResponseDTO.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .role(user.getRole())
                        .status(user.getStatus())
                        .deviceCount(user.getDevices() != null ? user.getDevices().size() : 0)
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void banUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(UserStatus.BANNED);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void unbanUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
    }

    @Override
    public DashboardStatsDTO getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalDevices = deviceRepository.count();
        long onlineDevices = deviceRepository.findAll().stream()
                .filter(d -> d.getStatus() == DeviceStatus.ONLINE)
                .count();
        long activeAlerts = 0;

        return DashboardStatsDTO.builder()
                .totalUsers(totalUsers)
                .totalDevices(totalDevices)
                .onlineDevices(onlineDevices)
                .activeAlerts(activeAlerts)
                .build();
    }
    @Override
    public List<ChartDataDTO> getUserGrowthStats() {
        List<User> users = userRepository.findAll();
        Map<String, Long> statsMap = new LinkedHashMap<>();

        LocalDateTime now = LocalDateTime.now();
        for (int i = 5; i >= 0; i--) {
            String monthKey = now.minusMonths(i).format(DateTimeFormatter.ofPattern("MM/yyyy"));
            statsMap.put(monthKey, 0L);
        }

        for (User user : users) {
            if (user.getCreatedAt() != null) {
                String key = user.getCreatedAt().format(DateTimeFormatter.ofPattern("MM/yyyy"));
                if (statsMap.containsKey(key)) {
                    statsMap.put(key, statsMap.get(key) + 1);
                }
            }
        }
        List<ChartDataDTO> result = new ArrayList<>();
        statsMap.forEach((k, v) -> result.add(new ChartDataDTO(k, v)));
        return result;
    }

    @Override
    public List<ChartDataDTO> getDeviceStatusStats() {
        long online = deviceRepository.findAll().stream()
                .filter(d -> d.getStatus() == DeviceStatus.ONLINE).count();
        long offline = deviceRepository.count() - online;

        List<ChartDataDTO> result = new ArrayList<>();
        result.add(new ChartDataDTO("Online", online));
        result.add(new ChartDataDTO("Offline", offline));

        return result;
    }
    @Override
    @Transactional
    public void deleteUser(Integer userId) {
        // 1. Tìm User
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // 2. Xử lý thiết bị: Trả về kho (Set owner = null) thay vì xóa vĩnh viễn
        List<Device> userDevices = deviceRepository.findByOwnerId(userId);
        if (!userDevices.isEmpty()) {
            for (Device device : userDevices) {
                device.setOwner(null);
                device.setName("Unclaimed Device"); // Reset tên về mặc định
                // device.setStatus(DeviceStatus.OFFLINE); // Tùy chọn: reset trạng thái
            }
            deviceRepository.saveAll(userDevices);
            log.info("Released {} devices for user {}", userDevices.size(), userId);
        }

        // 3. Xóa Verification Token (nếu có) để tránh lỗi Foreign Key
        tokenRepository.findByUser(user).ifPresent(token -> {
            tokenRepository.delete(token);
            log.info("Deleted verification token for user {}", userId);
        });

        // 4. Xóa User
        userRepository.delete(user);
        log.info("Permanently deleted user {}", userId);
    }
}