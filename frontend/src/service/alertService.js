import axios from './axiosCustomize';

/**
 * Lấy tất cả alerts của user
 */
const getMyAlerts = () => {
  const token = localStorage.getItem('accessToken');
  return axios.get('/api/alerts', {
    headers: { Authorization: `Bearer ${token}` }
  });
};

/**
 * Lấy alerts chưa đọc
 */
const getUnreadAlerts = () => {
  const token = localStorage.getItem('accessToken');
  return axios.get('/api/alerts/unread', {
    headers: { Authorization: `Bearer ${token}` }
  });
};

/**
 * Đánh dấu alert đã đọc
 */
const markAsRead = (alertId) => {
  const token = localStorage.getItem('accessToken');
  return axios.patch(`/api/alerts/${alertId}/read`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

/**
 * Đánh dấu tất cả đã đọc
 */
const markAllAsRead = () => {
  const token = localStorage.getItem('accessToken');
  return axios.patch('/api/alerts/read-all', {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export {
  getMyAlerts,
  getUnreadAlerts,
  markAsRead,
  markAllAsRead
};