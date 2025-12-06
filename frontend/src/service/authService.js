import axios from './axiosCustomize';

/**
 * API đăng nhập
 * @param {string} email - Email người dùng
 * @param {string} password - Mật khẩu
 * @returns {Promise} Response chứa accessToken, refreshToken
 */
const loginAPI = (email, password) => {
  return axios.post('/api/v1/auth/login', { email, password });
};

/**
 * API đăng ký tài khoản mới
 * @param {object} userData - Thông tin đăng ký: {fullName, email, password, phone}
 * @returns {Promise} Response chứa thông báo yêu cầu verify email
 */
const signUpAPI = (userData) => {
  return axios.post('/api/v1/auth/signup', userData);
};

/**
 * API đăng xuất
 * Gửi access token để BE blacklist token đó
 * @returns {Promise} Response xác nhận logout thành công
 */
const logoutAPI = () => {
  // Lấy token từ localStorage
  const token = localStorage.getItem('accessToken');
  
  return axios.post('/api/v1/auth/logout', {}, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

/**
 * API làm mới access token
 * @param {string} refreshToken - Refresh token hiện tại
 * @returns {Promise} Response chứa accessToken mới
 */
const refreshTokenAPI = (refreshToken) => {
  return axios.post('/api/v1/auth/refresh-token', { refreshToken });
};

/**
 * API verify email thông qua token
 * @param {string} token - Token từ email verification link
 * @returns {Promise} Response xác nhận tài khoản đã được kích hoạt
 */
const verifyEmailAPI = (token) => {
  return axios.get(`/api/v1/auth/verify?token=${token}`);
};

export { 
  loginAPI, 
  signUpAPI, 
  logoutAPI, 
  refreshTokenAPI,
  verifyEmailAPI 
};