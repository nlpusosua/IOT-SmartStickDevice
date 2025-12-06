import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import AuthLayout from '../AuthLayout';
import { signUpAPI, verifyEmailAPI } from '../../../service/authService';
import { toast } from 'react-toastify';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [countdown, setCountdown] = useState(60); // 60 giây countdown
  const [canResend, setCanResend] = useState(false);
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // 'pending' | 'success' | 'error'

  /**
   * Lấy email từ localStorage khi component mount
   */
  useEffect(() => {
    const savedEmail = localStorage.getItem('pendingVerificationEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  /**
   * Tự động verify nếu có token trong URL
   * URL format: /verify?token=xxx-xxx-xxx
   */
  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      handleAutoVerify(token);
    }
  }, [searchParams]);

  /**
   * Xử lý tự động verify khi click vào link trong email
   */
  const handleAutoVerify = async (token) => {
    setIsVerifying(true);
    setVerificationStatus('pending');

    try {
      const response = await verifyEmailAPI(token);
      
      // Verification thành công
      setVerificationStatus('success');
      toast.success(response || "Tài khoản của bạn đã được kích hoạt thành công!");
      
      // Xóa email pending khỏi localStorage
      localStorage.removeItem('pendingVerificationEmail');
      
      // Chờ 2 giây để user đọc thông báo, sau đó redirect về login
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Tài khoản đã được kích hoạt. Vui lòng đăng nhập!' }
        });
      }, 2000);

    } catch (error) {
      setVerificationStatus('error');
      
      if (error.response && error.response.data) {
        const errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : error.response.data.message || "Xác thực thất bại";
        
        toast.error(errorMessage);
      } else {
        toast.error("Lỗi kết nối! Vui lòng thử lại sau.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Countdown timer cho nút "Gửi lại"
   */
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  /**
   * Xử lý gửi lại email xác thực
   * (Trong thực tế, BE cần có endpoint riêng để resend email)
   */
  const handleResend = async () => {
    if (!canResend || !email) return;

    try {
      // GIẢ SỬ: Backend có endpoint /api/v1/auth/resend-verification
      // Hoặc có thể gọi lại signUpAPI với email đã lưu
      
      toast.info("Đang gửi lại email xác thực...");
      
      // TODO: Thay thế bằng API call thật
      // await resendVerificationAPI(email);
      
      // Reset countdown
      setCountdown(60);
      setCanResend(false);
      
      toast.success("Đã gửi lại email xác thực! Vui lòng kiểm tra hộp thư.");
      
    } catch (error) {
      toast.error("Không thể gửi lại email. Vui lòng thử lại sau.");
    }
  };

  /**
   * Render nội dung dựa trên trạng thái verification
   */
  const renderContent = () => {
    // Đang verify (có token trong URL)
    if (isVerifying) {
      return (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Đang xác thực tài khoản...
          </h3>
          <p className="text-sm text-gray-600">
            Vui lòng chờ trong giây lát
          </p>
        </div>
      );
    }

    // Verify thành công
    if (verificationStatus === 'success') {
      return (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Xác thực thành công!
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Tài khoản của bạn đã được kích hoạt. Đang chuyển hướng đến trang đăng nhập...
          </p>
          <div className="flex items-center justify-center">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
          </div>
        </div>
      );
    }

    // Verify thất bại
    if (verificationStatus === 'error') {
      return (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Xác thực thất bại
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Link xác thực không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi lại email xác thực.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Quay lại đăng ký
          </button>
        </div>
      );
    }

    // Pending - Chờ user click vào link trong email
    return (
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Chúng tôi đã gửi một liên kết xác thực đến email{' '}
          <span className="font-semibold text-gray-900">{email || 'user@example.com'}</span>. 
          Vui lòng click vào liên kết đó để kích hoạt tài khoản.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/login')}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Quay lại đăng nhập
          </button>

          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm text-gray-500">Không nhận được mã?</span>
            <button
              onClick={handleResend}
              disabled={!canResend}
              className={`text-sm font-medium flex items-center gap-1 ${
                canResend 
                  ? 'text-blue-600 hover:text-blue-500 cursor-pointer' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              {canResend ? (
                <>Gửi lại</>
              ) : (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Gửi lại sau {countdown}s
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AuthLayout 
      title="Xác thực Email" 
      subtitle="Vui lòng kiểm tra hộp thư đến của bạn"
    >
      {renderContent()}
    </AuthLayout>
  );
};

export default VerifyEmail;