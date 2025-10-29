package com.example.IOT_SmartStick.repository;

import com.example.IOT_SmartStick.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeviceRepository extends JpaRepository<Device, Integer> {
    Optional<Device> findByDeviceToken(String deviceToken);
}
