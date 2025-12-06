import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Component bảo vệ các route cần authentication
 * Nếu user chưa login → redirect về /login
 * Nếu đã login → render children (component được bảo vệ)
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  /**
   * Kiểm tra xem user đã login chưa
   * Cách đơn giản: Check có accessToken trong localStorage không
   * Cách phức tạp hơn: Decode JWT và check expiry time
   */
  const isAuthenticated = () => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      return false;
    }

    // TODO: Có thể thêm logic decode JWT và check expiry
    // const decoded = jwtDecode(token);
    // return decoded.exp * 1000 > Date.now();
    
    return true;
  };

  // Nếu chưa login → Redirect về login page
  // Lưu current location để sau khi login xong có thể quay lại đúng trang
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Đã login → Render component con
  return children;
};

export default ProtectedRoute;