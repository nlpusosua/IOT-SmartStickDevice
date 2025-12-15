package com.example.IOT_SmartStick.dto.sendSignal;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class StatusData {

    @JsonProperty("sos")
    private Boolean sos; // false [cite: 213]

    @JsonProperty("lost")
    private Boolean lost;

    @JsonProperty("motion")
    private String motion; // "IDLE" [cite: 215]
}
