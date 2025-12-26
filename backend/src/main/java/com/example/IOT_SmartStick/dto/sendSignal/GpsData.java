package com.example.IOT_SmartStick.dto.sendSignal;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class GpsData {
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Double speed;
}
