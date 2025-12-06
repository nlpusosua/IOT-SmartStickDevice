import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, Loader2, ArrowRight } from 'lucide-react';
import AuthLayout from '../AuthLayout';
import { signUpAPI } from '../../../service/authService';
import { toast } from 'react-toastify';

const SignUp = () => {
  const navigate = useNavigate();
  
  // State cho form fields
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  /**
   * Cập nhật state khi người dùng nhập liệu
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Xử lý submit form đăng ký
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validation cơ bản
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.warning("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.warning("Email không hợp lệ!");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast.warning("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    setLoading(true);

    try {
      // Gọi API đăng ký
      const response = await signUpAPI(formData);
      
      // Backend trả về: { accessToken: null, message: "Sign up successful. Please check your email..." }
      if (response && response.message) {
        toast.success(response.message);
        
        // Lưu email để hiển thị ở trang verify
        localStorage.setItem('pendingVerificationEmail', formData.email);
        
        // Chuyển sang trang xác thực email
        navigate('/verify');
      }

    } catch (error) {
      // Xử lý lỗi từ Backend
      if (error.response && error.response.data) {
        // Backend trả về string hoặc object { message: "..." }
        const errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : error.response.data.message || "Đã có lỗi xảy ra";
        
        toast.error(errorMessage);
      } else {
        toast.error("Lỗi kết nối đến Server! Vui lòng kiểm tra mạng.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Đăng ký tài khoản" subtitle="Tạo tài khoản quản lý người thân">
      <form className="space-y-5" onSubmit={handleRegister}>
        
        {/* Họ và tên */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              placeholder="Nguyễn Văn A"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              placeholder="email@example.com"
            />
          </div>
        </div>

        {/* Mật khẩu */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Mật khẩu <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              placeholder="••••••••"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Tối thiểu 6 ký tự</p>
        </div>

        {/* Số điện thoại (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Số điện thoại <span className="text-gray-400">(Tùy chọn)</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              placeholder="0987654321"
            />
          </div>
        </div>

        {/* Button Submit */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-400"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Đang xử lý...
              </>
            ) : (
              <>
                Tạo tài khoản
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Đăng nhập
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignUp;