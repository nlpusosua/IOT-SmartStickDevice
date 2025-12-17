// service/geofenceService.js
import axios from "./axiosCustomize";

/**
 * Tạo geofence mới
 */
const createGeofence = (deviceId, geofenceData) => {
  const token = localStorage.getItem("accessToken");
  return axios.post(`/api/geofence/device/${deviceId}`, geofenceData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * Lấy danh sách geofence của device
 */
const getGeofencesByDevice = (deviceId) => {
  const token = localStorage.getItem("accessToken");
  return axios.get(`/api/geofence/device/${deviceId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * Cập nhật geofence
 */
const updateGeofence = (geofenceId, geofenceData) => {
  const token = localStorage.getItem("accessToken");
  return axios.put(`/api/geofence/${geofenceId}`, geofenceData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * Bật/tắt geofence
 */
const toggleGeofence = (geofenceId) => {
  const token = localStorage.getItem("accessToken");
  return axios.patch(`/api/geofence/${geofenceId}/toggle`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * Xóa geofence
 */
const deleteGeofence = (geofenceId) => {
  const token = localStorage.getItem("accessToken");
  return axios.delete(`/api/geofence/${geofenceId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export {
  createGeofence,
  getGeofencesByDevice,
  updateGeofence,
  toggleGeofence,
  deleteGeofence,
};