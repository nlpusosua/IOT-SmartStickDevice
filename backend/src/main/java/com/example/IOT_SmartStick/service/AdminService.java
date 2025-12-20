package com.example.IOT_SmartStick.service;

import com.example.IOT_SmartStick.dto.response.ChartDataDTO;
import com.example.IOT_SmartStick.dto.response.DashboardStatsDTO;
import com.example.IOT_SmartStick.dto.response.UserResponseDTO;
import java.util.List;

public interface AdminService {
    List<UserResponseDTO> getAllUsers();
    void banUser(Integer userId);
    void unbanUser(Integer userId);
    DashboardStatsDTO getDashboardStats();
    List<ChartDataDTO> getUserGrowthStats();
    List<ChartDataDTO> getDeviceStatusStats();
}