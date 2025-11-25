import axios from './axiosCustomize';

const loginAPI = (email, password) => {
  // Đường dẫn khớp với AuthController trong file jwt2.txt [cite: 90, 93]
  return axios.post('/api/v1/auth/login', { email, password });
};

export { loginAPI };