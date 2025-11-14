package com.example.IOT_SmartStick.controller;

import com.example.IOT_SmartStick.dto.DeviceUpdateDTO;
import com.example.IOT_SmartStick.dto.request.DeviceRequestDTO;
import com.example.IOT_SmartStick.dto.response.DeviceResponseDTO;
import com.example.IOT_SmartStick.dto.sendSignal.IngestLocationRequest;
import com.example.IOT_SmartStick.service.DeviceService;
import com.example.IOT_SmartStick.service.IngestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/device")
@RequiredArgsConstructor
public class DeviceController {
    private final DeviceService deviceService;
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

    @PostMapping
    public ResponseEntity<DeviceResponseDTO> creatDevice(@Valid @RequestBody DeviceRequestDTO requestDTO, @RequestParam Integer ownerId){
        DeviceResponseDTO response = deviceService.createDevice(requestDTO, ownerId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeviceResponseDTO> getDeviceById(@PathVariable Integer id){
        DeviceResponseDTO response = deviceService.getDeviceById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<DeviceResponseDTO>> getAllDevice(){
        List<DeviceResponseDTO> devices = deviceService.getAllDevices();
        return ResponseEntity.ok(devices);
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<DeviceResponseDTO>> getDevicesByOwner(@PathVariable Integer ownerId){
        List<DeviceResponseDTO> devices = deviceService.getDevicesByOwnerId(ownerId);
        return ResponseEntity.ok(devices);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeviceResponseDTO> updateDevice(@PathVariable Integer id, @RequestBody DeviceUpdateDTO updateDTO){
        DeviceResponseDTO response = deviceService.updateDevice(id, updateDTO);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDevice(@PathVariable Integer id) {
        deviceService.deleteDevice(id);
        return ResponseEntity.noContent().build();
    }
}
