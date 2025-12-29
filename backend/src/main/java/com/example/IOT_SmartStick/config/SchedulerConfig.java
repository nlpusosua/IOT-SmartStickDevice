package com.example.IOT_SmartStick.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class SchedulerConfig {
    // Class này dùng để kích hoạt tính năng chạy tác vụ ngầm (Cron Job)
}