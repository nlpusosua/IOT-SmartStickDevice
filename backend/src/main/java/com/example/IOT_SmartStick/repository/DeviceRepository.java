package com.example.IOT_SmartStick.repository;

import com.example.IOT_SmartStick.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DeviceRepository extends JpaRepository<Device, Long> {
    Optional<Device> findByDeviceToken(String deviceToken);
    List<Device> findByOwnerId(Integer ownerId);
    boolean existsByDeviceToken(String deviceToken);
    @Modifying
    @Query("UPDATE Device d SET d.status = 'OFFLINE' WHERE d.status = 'ONLINE' AND d.lastSeen < :threshold")
    int markDevicesOffline(@Param("threshold") LocalDateTime threshold);
}
