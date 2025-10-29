package com.example.IOT_SmartStick.dto.sendSignal;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class NetworkData {

    @JsonProperty("type")
    private String type; // "wifi" [cite: 191]

    @JsonProperty("signalStrength")
    private Integer signalStrength; // -67 [cite: 192]

    @JsonProperty("gsmImei")
    private String gsmImei; // "864234050112345" [cite: 193]

    @JsonProperty("gprsConnected")
    private Boolean gprsConnected; // false [cite: 194]
}
