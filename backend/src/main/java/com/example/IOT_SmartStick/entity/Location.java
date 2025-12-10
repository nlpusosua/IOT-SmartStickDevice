package com.example.IOT_SmartStick.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "locations", indexes = {
        // Index giúp tìm lịch sử di chuyển của 1 thiết bị trong khoảng thời gian cực nhanh
        @Index(name = "idx_device_timestamp", columnList = "device_id, timestamp")
})
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // BẮT BUỘC dùng Long, vì bảng này sẽ có triệu bản ghi rất nhanh

    @Column(nullable = false)
    private Double latitude; // Dùng Double xử lý nhanh hơn BigDecimal cho bản đồ

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private LocalDateTime timestamp; // Thời gian thiết bị ghi nhận vị trí

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    @ToString.Exclude
    private Device device;
}