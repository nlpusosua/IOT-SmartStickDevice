// FRONTEND/src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAPI, signupAPI, logoutAPI } from '../service/authService';
import { toast } from 'react-toastify';

// Tạo Context để chia sẻ state auth ra toàn bộ app
const AuthContext = createContext(null);

// Hook để dùng AuthContext ở các component con
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng trong AuthProvider');
  }
  return context;
};

// Provider bọc toàn bộ app để cung cấp auth state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Kiểm tra token khi app khởi động
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        // Có thể decode JWT để lấy user info
        // hoặc gọi API /me để lấy thông tin user
        setUser({ token }); // Simplified version
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Hàm đăng nhập
  const login = async (email, password) => {
    try {
      const data = await loginAPI(email, password);
      
      if (data && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        setUser({ token: data.accessToken });
        toast.success('Đăng nhập thành công!');
        navigate('/');
        return { success: true };
      }
    } catch (error) {
      const errorMsg = error.response?.data || 'Đăng nhập thất bại';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Hàm đăng ký
  const signup = async (fullName, email, password, phone) => {
    try {
      const data = await signupAPI(fullName, email, password, phone);
      
      toast.success(data.message || 'Đăng ký thành công! Vui lòng kiểm tra email.');
      navigate('/verify');
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data || 'Đăng ký thất bại';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Hàm đăng xuất
  const logout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await logoutAPI(token);
      }
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      toast.success('Đăng xuất thành công!');
      navigate('/login');
    } catch (error) {
      // Vẫn clear local storage dù API fail
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      navigate('/login');
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};