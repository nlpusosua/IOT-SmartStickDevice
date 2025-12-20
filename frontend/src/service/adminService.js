import axios from './axiosCustomize';

// Users
export const getAllUsers = () => {
    return axios.get('/api/admin/users');
};

export const banUser = (userId) => {
    return axios.patch(`/api/admin/users/${userId}/ban`);
};

export const unbanUser = (userId) => {
    return axios.patch(`/api/admin/users/${userId}/unban`);
};

// Devices (Tận dụng các API Admin bạn đã có ở backend)
export const getAllDevicesAdmin = () => {
    return axios.get('/api/admin/devices');
};

export const createDeviceAdmin = (deviceData) => {
    // deviceData: { deviceToken, name }
    return axios.post('/api/admin/devices', deviceData);
};

export const deleteDeviceAdmin = (deviceId) => {
    return axios.delete(`/api/admin/devices/${deviceId}`);
};

export const updateDeviceAdmin = (deviceId, data) => {
    return axios.put(`/api/admin/devices/${deviceId}`, data);
};

// Stats
export const getAdminStats = () => {
    return axios.get('/api/admin/stats');
};

export const getUserGrowthStats = () => {
    return axios.get('/api/admin/stats/user-growth');
};

export const getDeviceStatusStats = () => {
    return axios.get('/api/admin/stats/device-status');
};