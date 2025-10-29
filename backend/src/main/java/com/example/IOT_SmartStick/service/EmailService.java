package com.example.IOT_SmartStick.service;

import com.example.IOT_SmartStick.entity.User;

public interface EmailService {
    void sendVerificationEmail(User user, String token);
}
