package com.example.IOT_SmartStick.service;

import com.example.IOT_SmartStick.dto.request.GeofenceRequestDTO;
import com.example.IOT_SmartStick.dto.response.GeofenceResponseDTO;

import java.util.List;

public interface GeofenceService {
    GeofenceResponseDTO createGeofence(Long deviceId, GeofenceRequestDTO request, String token);
    GeofenceResponseDTO updateGeofence(Long geofenceId, GeofenceRequestDTO request, String token);
    void deleteGeofence(Long geofenceId, String token);
    GeofenceResponseDTO getGeofenceById(Long geofenceId, String token);
    List<GeofenceResponseDTO> getGeofencesByDevice(Long deviceId, String token);
    GeofenceResponseDTO toggleGeofenceStatus(Long geofenceId, String token);
}