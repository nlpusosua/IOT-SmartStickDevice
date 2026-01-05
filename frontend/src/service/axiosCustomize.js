import axios from "axios";
import { refreshTokenAPI } from "./authService";

const instance = axios.create({
  baseURL: "http://35.186.145.70:8080",
  // baseURL: "http://localhost:8080",
});

// Biến để theo dõi có đang refresh token không (tránh gọi nhiều lần)
let isRefreshing = false;
let failedQueue = [];

/**
 * Xử lý các request đang chờ sau khi refresh token
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// ===== REQUEST INTERCEPTOR =====
// Tự động thêm access token vào header của mọi request
instance.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// ===== RESPONSE INTERCEPTOR =====
instance.interceptors.response.use(
  function (response) {
    // Response thành công → Trả về data
    return response.data ? response.data : response;
  },
  async function (error) {
    const originalRequest = error.config;

    // Nếu lỗi 401 (Unauthorized) và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nếu đang ở trang login/signup thì không cần refresh
      if (
        originalRequest.url.includes("/auth/login") ||
        originalRequest.url.includes("/auth/signup")
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Nếu đang refresh token, đưa request vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return instance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // Không có refresh token → Logout
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Gọi API refresh token
        const response = await refreshTokenAPI(refreshToken);
        const { accessToken } = response;

        // Lưu token mới
        localStorage.setItem("accessToken", accessToken);

        // Cập nhật header cho request ban đầu
        originalRequest.headers["Authorization"] = "Bearer " + accessToken;

        // Xử lý các request đang chờ
        processQueue(null, accessToken);

        // Gọi lại request ban đầu với token mới
        return instance(originalRequest);
      } catch (refreshError) {
        // Refresh token cũng fail → Logout
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Các lỗi khác
    return Promise.reject(error);
  }
);

export default instance;
