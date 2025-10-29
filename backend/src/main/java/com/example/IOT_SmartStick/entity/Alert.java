package com.example.IOT_SmartStick.entity;

import com.example.IOT_SmartStick.constant.AlertType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "alerts")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertType alertType;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    // Mối quan hệ: Nhiều Alert thuộc về một Device
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    // Mối quan hệ: Một Alert có thể được ghi nhận tại một Location cụ thể
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id") // Có thể null
    private Location location;
}
