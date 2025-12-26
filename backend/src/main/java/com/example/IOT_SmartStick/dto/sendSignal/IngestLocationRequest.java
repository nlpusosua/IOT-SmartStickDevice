package com.example.IOT_SmartStick.dto.sendSignal;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class IngestLocationRequest {

    @JsonProperty("deviceToken")
    private String deviceToken;

    @JsonProperty("timestamp")
    private String timestamp;

    @NotNull
    @JsonProperty("gps")
    private GpsData gps;

    @JsonProperty("network")
    private NetworkData network;

    @NotNull
    @JsonProperty("status")
    private StatusData status;

}
