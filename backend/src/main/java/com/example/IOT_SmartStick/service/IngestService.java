package com.example.IOT_SmartStick.service;

import com.example.IOT_SmartStick.dto.sendSignal.IngestLocationRequest;

public interface IngestService {
    /**
     * Xác thực token và lưu trữ dữ liệu vị trí từ thiết bị.
     * @param authHeader Nội dung header "Authorization" (vd: "Bearer my_secret...")
     * @param payload Dữ liệu JSON đã được parse
     */
    void ingestDeviceData(String authHeader, IngestLocationRequest payload);
}
