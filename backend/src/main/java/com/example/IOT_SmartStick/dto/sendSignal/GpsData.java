package com.example.IOT_SmartStick.dto.sendSignal;

import lombok.Data;

import java.math.BigDecimal;

@Data // Lombok tự tạo getter, setter, constructor...
public class GpsData {
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Double altitude;
    private Double speed;
}
