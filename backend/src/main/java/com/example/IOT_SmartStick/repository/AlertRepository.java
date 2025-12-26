package com.example.IOT_SmartStick.repository;

import com.example.IOT_SmartStick.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    @Query("SELECT a FROM Alert a WHERE a.device.owner.id = :userId ORDER BY a.timestamp DESC")
    List<Alert> findByUserId(@Param("userId") Integer userId);

    @Query("SELECT a FROM Alert a WHERE a.device.owner.id = :userId AND a.isRead = false ORDER BY a.timestamp DESC")
    List<Alert> findUnreadByUserId(@Param("userId") Integer userId);

    @Query("SELECT a FROM Alert a WHERE a.device.owner.id = :userId AND a.timestamp BETWEEN :start AND :end ORDER BY a.timestamp DESC")
    List<Alert> findByUserIdAndTimeRange(@Param("userId") Integer userId,
                                         @Param("start") LocalDateTime start,
                                         @Param("end") LocalDateTime end);
}