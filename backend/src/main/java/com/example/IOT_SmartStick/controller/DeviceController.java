package com.example.IOT_SmartStick.controller;

import com.example.IOT_SmartStick.dto.sendSignal.IngestLocationRequest;
import com.example.IOT_SmartStick.service.IngestService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ingest")
public class DeviceController {

    @Autowired
    private IngestService ingestService;

    @PostMapping("/location")
    public ResponseEntity<String> receiveLocation(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody IngestLocationRequest payload) {

        try {
            ingestService.ingestDeviceData(authHeader, payload);
            return ResponseEntity.ok("Data received successfully");
        } catch (SecurityException e) {
            return ResponseEntity.status(401).body(e.getMessage()); // 401 Unauthorized
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }
}