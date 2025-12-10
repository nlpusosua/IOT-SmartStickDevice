package com.example.IOT_SmartStick.entity;

import com.example.IOT_SmartStick.constant.DeviceStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "devices")
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Khuyên dùng Long cho ID

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String deviceToken; // IMEI hoặc Serial Number

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DeviceStatus status = DeviceStatus.OFFLINE;

    // --- CÁC TRƯỜNG CACHE (MỚI THÊM) ---
    // Lưu vị trí và pin mới nhất tại đây để hiển thị lên bản đồ ngay lập tức
    private Double lastLatitude;

    private Double lastLongitude;

    // Thời điểm cuối cùng thiết bị gửi dữ liệu (khác với lastUpdate bên dưới)
    private LocalDateTime lastSeen;
    // ------------------------------------

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime lastUpdate; // Thời điểm record này bị thay đổi thông tin (đổi tên, đổi chủ...)

    // Cho phép owner là null (thiết bị trong kho)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = true)
    @ToString.Exclude // Quan trọng: Tránh lỗi vòng lặp khi in log
    private User owner;

    @OneToMany(mappedBy = "device", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude // Quan trọng: Tránh load toàn bộ list history khi log Device
    private List<Location> locations;

    @OneToMany(mappedBy = "device", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Geofence> geofences;

    @OneToMany(mappedBy = "device", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Alert> alerts;
}