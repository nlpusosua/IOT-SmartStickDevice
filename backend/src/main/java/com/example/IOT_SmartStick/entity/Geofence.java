package com.example.IOT_SmartStick.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "geofences")
public class Geofence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // VD: "Nhà của bà", "Công viên"

    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal centerLatitude;

    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal centerLongitude;

    @Column(nullable = false)
    private Integer radiusMeters; // Bán kính tính bằng mét

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true; // Bật/tắt geofence

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Mối quan hệ: Một Device có thể có nhiều Geofence
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    // Phương thức kiểm tra điểm có nằm trong geofence không
    public boolean isPointInside(double lat, double lng) {
        double distance = calculateDistance(
                centerLatitude.doubleValue(),
                centerLongitude.doubleValue(),
                lat,
                lng
        );
        return distance <= radiusMeters;
    }

    // Tính khoảng cách giữa 2 điểm (Haversine formula)
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS = 6371000; // meters

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c;
    }
}