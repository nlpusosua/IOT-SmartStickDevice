package com.example.IOT_SmartStick.dto.sendSignal;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class IngestLocationRequest {

    @JsonProperty("deviceId") // Khớp chính xác với key trong JSON
    private String deviceId; // "SMARTCANE-0001"

    @JsonProperty("timestamp")
    private String timestamp; // "2025-10-05T21:32:15Z"

    @NotNull // Đảm bảo các thông tin quan trọng phải có
    @JsonProperty("gps")
    private GpsData gps;


    @JsonProperty("network")
    private NetworkData network; // (tự tạo class này)

    @NotNull
    @JsonProperty("status")
    private StatusData status; // (tự tạo class này)

}
