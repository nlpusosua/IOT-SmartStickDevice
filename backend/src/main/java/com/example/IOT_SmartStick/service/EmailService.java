package com.example.IOT_SmartStick.service;

import com.example.IOT_SmartStick.constant.AlertType;
import com.example.IOT_SmartStick.entity.Device;
import com.example.IOT_SmartStick.entity.Location;
import com.example.IOT_SmartStick.entity.User;


public interface EmailService {
    void sendVerificationEmail(User user, String token);
    void sendAlertEmail(User user, Device device, Location location, AlertType alertType, String message);
}
