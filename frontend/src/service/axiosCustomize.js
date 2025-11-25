import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8080', // Cổng mặc định của Spring Boot
});

// Interceptor cho Response: Giúp lấy data gọn gàng hơn
instance.interceptors.response.use(
  function (response) {
    // Nếu BE trả về data bọc trong response.data, ta lấy luôn
    return response.data ? response.data : response;
  },
  function (error) {
    // Xử lý lỗi tập trung
    return Promise.reject(error);
  }
);

export default instance;