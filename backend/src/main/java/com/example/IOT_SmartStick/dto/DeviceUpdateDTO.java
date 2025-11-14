package com.example.IOT_SmartStick.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeviceUpdateDTO {
    private String name;
    private String deviceToken;
}
