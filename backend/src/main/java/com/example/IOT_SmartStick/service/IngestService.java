package com.example.IOT_SmartStick.service;

import com.example.IOT_SmartStick.dto.sendSignal.IngestLocationRequest;

public interface IngestService {
    void ingestDeviceData(String authHeader, IngestLocationRequest payload);
}
