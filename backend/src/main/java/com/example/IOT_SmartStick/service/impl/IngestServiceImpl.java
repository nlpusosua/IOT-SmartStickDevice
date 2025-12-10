package com.example.IOT_SmartStick.service.impl;

import com.example.IOT_SmartStick.dto.sendSignal.IngestLocationRequest;
import com.example.IOT_SmartStick.entity.Device;
import com.example.IOT_SmartStick.entity.Location;
import com.example.IOT_SmartStick.repository.DeviceRepository;
import com.example.IOT_SmartStick.repository.LocationRepository;
import com.example.IOT_SmartStick.service.IngestService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@Service
public class IngestServiceImpl implements IngestService {
    @Autowired
    private DeviceRepository deviceRepository;
    @Autowired
    private LocationRepository locationRepository;

    @Override
    public void ingestDeviceData(String authHeader, IngestLocationRequest payload) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new SecurityException("Missing or invalid Authorization header");
        }

        // 1. Lấy token từ header
        String token = authHeader.substring(7); // Bỏ "Bearer "

        // 2. Xác thực token (Cách 2)
        Device device = deviceRepository.findByDeviceToken(token)
                .orElseThrow(() -> new SecurityException("Invalid device token: " + token));

        // 3. Token hợp lệ -> Lấy dữ liệu từ DTO
        System.out.println("Đã xác thực thành công device: " + device.getName());

        Location newLocation = new Location();
        newLocation.setDevice(device);

//        // 4. Map dữ liệu từ DTO -> Entity
//        newLocation.setLatitude(payload.getGps().getLatitude());
//        newLocation.setLongitude(payload.getGps().getLongitude());


        // Xử lý timestamp (nên dùng Instant.parse() để lấy đúng time, tạm thời dùng time server)
        newLocation.setTimestamp(LocalDateTime.from(Instant.now()));

        // 5. Lưu vào CSDL
        locationRepository.save(newLocation);
        System.out.println("Đã lưu vị trí mới cho device: " + device.getName());
    }
}
