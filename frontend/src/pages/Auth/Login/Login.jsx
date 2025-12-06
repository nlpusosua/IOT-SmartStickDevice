import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import AuthLayout from '../AuthLayout';
import { loginAPI } from '../../../service/authService';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Hiển thị message từ trang verify (nếu có)
   * VD: "Tài khoản đã được kích hoạt. Vui lòng đăng nhập!"
   */
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      // Xóa message khỏi state để tránh hiển thị lại khi refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  /**
   * Xử lý đăng nhập
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validate cơ bản
    if (!email || !password) {
      toast.warning("Vui lòng nhập đầy đủ email và mật khẩu!");
      return;
    }

    setLoading(true);

    try {
      // Gọi API Login
      const data = await loginAPI(email, password);
      
      // Backend trả về: { accessToken, refreshToken, message, ... }
      if (data && data.accessToken) {
        // Lưu token vào LocalStorage
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        // Thông báo và chuyển trang
        toast.success(data.message || "Đăng nhập thành công!");
        
        // Chuyển về trang chủ (Dashboard)
        navigate('/'); 
      } else {
        toast.error("Đăng nhập thất bại: Không nhận được token.");
      }

    } catch (error) {
      // Xử lý lỗi từ Backend
      if (error.response && error.response.data) {
        // TRƯỜNG HỢP 1: Backend trả về chuỗi text thô
        if (typeof error.response.data === 'string') {
          toast.error(error.response.data);
        } 
        // TRƯỜNG HỢP 2: Backend trả về Object JSON { message: "..." }
        else if (error.response.data.message) {
          toast.error(error.response.data.message);
        } 
        // TRƯỜNG HỢP KHÁC
        else {
          toast.error("Đã có lỗi xảy ra");
        }
      } else {
        // Lỗi mất mạng hoặc không gọi được server
        toast.error("Lỗi kết nối đến Server! Vui lòng kiểm tra mạng.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Đăng nhập" subtitle="Truy cập vào hệ thống giám sát">
      <form className="space-y-6" onSubmit={handleLogin}>
        
        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              placeholder="email@example.com"
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Ghi nhớ
            </label>
          </div>

          <div className="text-sm">
            <Link 
              to="/forgot-password" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Đang xử lý...
              </>
            ) : (
              <>
                Đăng nhập
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Link to Sign Up */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;