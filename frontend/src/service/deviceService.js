// FRONTEND/src/service/deviceService.js
import axios from './axiosCustomize';

/**
 * Lấy tất cả devices
 * GET /api/device
 */
export const getAllDevicesAPI = () => {
  return axios.get('/api/device');
};

/**
 * Lấy device theo ID
 * GET /api/device/{id}
 */
export const getDeviceByIdAPI = (id) => {
  return axios.get(`/api/device/${id}`);
};

/**
 * Lấy devices theo owner ID
 * GET /api/device/owner/{ownerId}
 */
export const getDevicesByOwnerAPI = (ownerId) => {
  return axios.get(`/api/device/owner/${ownerId}`);
};

/**
 * Tạo device mới
 * POST /api/device?ownerId=xxx
 * Body: { name, deviceToken }
 */
export const createDeviceAPI = (deviceData, ownerId) => {
  return axios.post(`/api/device?ownerId=${ownerId}`, deviceData);
};

/**
 * Cập nhật device
 * PUT /api/device/{id}
 * Body: { name?, deviceToken? }
 */
export const updateDeviceAPI = (id, deviceData) => {
  return axios.put(`/api/device/${id}`, deviceData);
};

/**
 * Xóa device
 * DELETE /api/device/{id}
 */
export const deleteDeviceAPI = (id) => {
  return axios.delete(`/api/device/${id}`);
};