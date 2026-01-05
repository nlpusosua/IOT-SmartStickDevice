package com.example.IOT_SmartStick.service;

import com.example.IOT_SmartStick.entity.Device;
import com.example.IOT_SmartStick.entity.Location;

import java.time.LocalDateTime;

public interface NotificationService {
    void sendSOSAlert(Device device, Location location);
    void sendLostAlert(Device device, Location location);
    void sendGeofenceAlert(Device device, String type, String geofenceName, double lat, double lng, double radius, LocalDateTime timestamp);
}