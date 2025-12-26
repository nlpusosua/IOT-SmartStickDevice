package com.example.IOT_SmartStick.dto.sendSignal;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class NetworkData {

    @JsonProperty("type")
    private String type;

    @JsonProperty("signalStrength")
    private Integer signalStrength;

    @JsonProperty("gprsConnected")
    private Boolean gprsConnected;
}
