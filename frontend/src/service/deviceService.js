import axios from "./axiosCustomize";

// ========== USER API ==========

// Lấy danh sách device của user hiện tại
const getMyDevices = () => {
  const token = localStorage.getItem("accessToken");
  return axios.get("/api/device/my-devices", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// User claim device bằng device_token
const claimDevice = (deviceToken, deviceName) => {
  const token = localStorage.getItem("accessToken");
  return axios.post(
    "/api/device/claim",
    {
      deviceToken,
      name: deviceName,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Cập nhật tên device
const updateDevice = (deviceId, newName) => {
  const token = localStorage.getItem("accessToken");
  return axios.put(
    `/api/device/${deviceId}`,
    { name: newName },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Xóa device khỏi tài khoản (device quay về kho)
const removeDevice = (deviceId) => {
  const token = localStorage.getItem("accessToken");
  return axios.delete(`/api/device/${deviceId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ========== ADMIN API (Nếu cần) ==========

// Admin tạo device mới
const adminCreateDevice = (deviceToken, deviceName) => {
  const token = localStorage.getItem("accessToken");
  return axios.post(
    "/api/admin/devices",
    {
      deviceToken,
      name: deviceName,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Admin lấy tất cả devices
const adminGetAllDevices = () => {
  const token = localStorage.getItem("accessToken");
  return axios.get("/api/admin/devices", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Admin cập nhật device
const adminUpdateDevice = (deviceId, deviceToken, deviceName) => {
  const token = localStorage.getItem("accessToken");
  return axios.put(
    `/api/admin/devices/${deviceId}`,
    {
      deviceToken,
      name: deviceName,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Admin xóa vĩnh viễn device
const adminDeleteDevice = (deviceId) => {
  const token = localStorage.getItem("accessToken");
  return axios.delete(`/api/admin/devices/${deviceId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Lấy lịch sử di chuyển của device
 * @param {number} deviceId - ID thiết bị
 * @param {number} hours - Số giờ gần nhất (mặc định 24h)
 */
const getDeviceHistory = (deviceId, hours = 24) => {
  const token = localStorage.getItem("accessToken");
  return axios.get(`/api/device/${deviceId}/history?hours=${hours}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Lấy lịch sử theo khoảng thời gian cụ thể
 */
const getDeviceHistoryByRange = (deviceId, startTime, endTime) => {
  const token = localStorage.getItem("accessToken");
  return axios.get(
    `/api/device/${deviceId}/history?startTime=${startTime}&endTime=${endTime}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export {
  // User APIs
  getMyDevices,
  claimDevice,
  updateDevice,
  removeDevice,
  getDeviceHistory,
  getDeviceHistoryByRange,

  // Admin APIs
  adminCreateDevice,
  adminGetAllDevices,
  adminUpdateDevice,
  adminDeleteDevice,
};
