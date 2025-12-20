package com.example.IOT_SmartStick.service.impl;

import com.example.IOT_SmartStick.constant.DeviceStatus;
import com.example.IOT_SmartStick.constant.UserStatus;
import com.example.IOT_SmartStick.dto.response.DashboardStatsDTO;
import com.example.IOT_SmartStick.dto.response.UserResponseDTO;
import com.example.IOT_SmartStick.entity.User;
import com.example.IOT_SmartStick.exception.ResourceNotFoundException;
import com.example.IOT_SmartStick.repository.AlertRepository;
import com.example.IOT_SmartStick.repository.DeviceRepository;
import com.example.IOT_SmartStick.repository.UserRepository;
import com.example.IOT_SmartStick.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.IOT_SmartStick.dto.response.ChartDataDTO;

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
    private final AlertRepository alertRepository; // Giả sử bạn có repository này

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
        // Giả sử lấy số alert chưa đọc làm active alerts
        long activeAlerts = 0; // alertRepository.countByIsReadFalse(); (Tùy chỉnh theo repo của bạn)

        return DashboardStatsDTO.builder()
                .totalUsers(totalUsers)
                .totalDevices(totalDevices)
                .onlineDevices(onlineDevices)
                .activeAlerts(activeAlerts)
                .build();
    }
    @Override
    public List<ChartDataDTO> getUserGrowthStats() {
        // Lấy tất cả user (hoặc có thể viết Query GROUP BY trong Repository nếu muốn tối ưu hơn cho DB lớn)
        List<User> users = userRepository.findAll();

        // Map để đếm số user theo tháng (Dùng LinkedHashMap để giữ thứ tự)
        // Key: "MM/yyyy", Value: Count
        Map<String, Long> statsMap = new LinkedHashMap<>();

        // Khởi tạo 6 tháng gần nhất bằng 0 để biểu đồ đẹp (không bị khuyết tháng)
        LocalDateTime now = LocalDateTime.now();
        for (int i = 5; i >= 0; i--) {
            String monthKey = now.minusMonths(i).format(DateTimeFormatter.ofPattern("MM/yyyy"));
            statsMap.put(monthKey, 0L);
        }

        // Duyệt qua user và cộng dồn
        for (User user : users) {
            if (user.getCreatedAt() != null) {
                String key = user.getCreatedAt().format(DateTimeFormatter.ofPattern("MM/yyyy"));
                // Chỉ tính nếu tháng đó nằm trong map (tức là trong 6 tháng gần đây)
                if (statsMap.containsKey(key)) {
                    statsMap.put(key, statsMap.get(key) + 1);
                }
            }
        }

        // Convert sang List DTO
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
}