package com.example.IOT_SmartStick.repository;

import com.example.IOT_SmartStick.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeviceRepository extends JpaRepository<Device, Long> {
    Optional<Device> findByDeviceToken(String deviceToken);
    List<Device> findByOwnerId(Integer ownerId);
    boolean existsByDeviceToken(String deviceToken);
}
