package com.example.IOT_SmartStick.repository;

import com.example.IOT_SmartStick.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface LocationRepository extends JpaRepository<Location, Long> {


    @Query(value = "SELECT * FROM locations " +
            "WHERE device_id = :deviceId " +
            "AND timestamp BETWEEN :startTime AND :endTime " +
            "ORDER BY timestamp ASC",
            nativeQuery = true)
    List<Location> findByDeviceIdAndTimestampBetween(
            @Param("deviceId") Long deviceId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );


    @Query(value = "SELECT * FROM locations WHERE device_id = :deviceId " +
            "ORDER BY timestamp DESC LIMIT :limit",
            nativeQuery = true)
    List<Location> findLastNLocationsByDeviceId(
            @Param("deviceId") Long deviceId,
            @Param("limit") int limit
    );
}