package com.example.IOT_SmartStick.repository;

import com.example.IOT_SmartStick.entity.Geofence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GeofenceRepository extends JpaRepository<Geofence, Long> {

    List<Geofence> findByDeviceId(Long deviceId);

    List<Geofence> findByDeviceIdAndActiveTrue(Long deviceId);

    @Query("SELECT g FROM Geofence g WHERE g.device.id = :deviceId AND g.device.owner.id = :ownerId")
    List<Geofence> findByDeviceIdAndOwnerId(@Param("deviceId") Long deviceId, @Param("ownerId") Integer ownerId);

    Optional<Geofence> findByIdAndDeviceOwnerId(Long id, Integer ownerId);
}
