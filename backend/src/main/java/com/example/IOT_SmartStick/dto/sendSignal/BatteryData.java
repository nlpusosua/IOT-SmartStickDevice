package com.example.IOT_SmartStick.dto.sendSignal;

import lombok.Data;

@Data
public class BatteryData {
    private Double voltage;
    private Integer level;
    private Boolean charging;
}
