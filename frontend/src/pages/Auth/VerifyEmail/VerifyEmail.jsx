import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, RefreshCw, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import AuthLayout from '../AuthLayout';
import { verifyEmailAPI } from '../../../service/authService';
import { toast } from 'react-toastify';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [email, setEmail] = useState('');
  
  // States quản lý UI
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // 'pending' | 'processing' | 'success' | 'error'

  /**
   * Lấy email từ localStorage (dành cho trường hợp vừa đăng ký xong)
   */
  useEffect(() => {
    const savedEmail = localStorage.getItem('pendingVerificationEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  /**
   * LOGIC CHÍNH: Tự động verify nếu có token trong URL
   * URL format: /verify?token=xxx-xxx-xxx
   */
  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      handleAutoVerify(token);
    } else {
        // Nếu không có token, tức là user vừa đăng ký xong và đang chờ mail
        setVerificationStatus('pending');
    }
  }, [searchParams]);

  const handleAutoVerify = async (token) => {
    setIsVerifying(true);
    setVerificationStatus('processing');

    try {
      // Gọi API Verify (GET)
      await verifyEmailAPI(token);
      
      // Thành công
      setVerificationStatus('success');
      toast.success("Tài khoản kích hoạt thành công!");
      localStorage.removeItem('pendingVerificationEmail');

      // Tự động chuyển trang sau 3s
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Tài khoản đã được kích hoạt. Vui lòng đăng nhập!' }
        });
      }, 3000);

    } catch (error) {
      setVerificationStatus('error');
      const errorMessage = error.response?.data?.message || 
                           (typeof error.response?.data === 'string' ? error.response.data : "Link xác thực không hợp lệ hoặc đã hết hạn.");
      toast.error(errorMessage);
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

  const handleResend = async () => {
    if (!canResend || !email) return;
    try {
      toast.info("Chức năng gửi lại đang được phát triển (giả lập thành công)...");
      // Thực tế: gọi API resend tại đây
      setCountdown(60);
      setCanResend(false);
    } catch (error) {
      toast.error("Lỗi gửi lại email");
    }
  };

  /**
   * Render nội dung dựa trên trạng thái
   */
  const renderContent = () => {
    // 1. Đang xử lý xác thực (Có token trong URL)
    if (verificationStatus === 'processing') {
      return (
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-50 mb-6">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Đang xác thực...
          </h3>
          <p className="text-gray-500">
            Hệ thống đang kiểm tra mã kích hoạt của bạn.
          </p>
        </div>
      );
    }

    // 2. Xác thực THÀNH CÔNG
    if (verificationStatus === 'success') {
      return (
        <div className="text-center py-8 animate-in fade-in zoom-in duration-500">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 shadow-sm">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Kích hoạt thành công!
          </h3>
          <p className="text-gray-600 mb-6">
            Tài khoản của bạn đã sẵn sàng sử dụng.<br/>
            Đang chuyển hướng đến trang đăng nhập...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Tự động chuyển sau 3s</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Đăng nhập ngay
          </button>
        </div>
      );
    }

    // 3. Xác thực THẤT BẠI
    if (verificationStatus === 'error') {
      return (
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Xác thực thất bại
          </h3>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto">
            Link xác thực không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại hoặc đăng ký lại.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/signup')}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Đăng ký tài khoản mới
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 px-4 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      );
    }

    // 4. Mặc định (Pending) - Chờ user check mail (Vừa đăng ký xong)
    return (
      <div className="text-center py-6">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-50 mb-6">
          <CheckCircle className="h-10 w-10 text-blue-600" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">Kiểm tra hộp thư</h3>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          Chúng tôi đã gửi link xác thực đến:<br/>
          <span className="font-semibold text-gray-900 block mt-1 text-lg">{email || 'email@example.com'}</span>
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-500 text-left">
          <p>📧 Không thấy email?</p>
          <ul className="list-disc list-inside mt-1 ml-1 space-y-1">
            <li>Kiểm tra mục Spam hoặc Quảng cáo</li>
            <li>Đợi khoảng 1-2 phút</li>
          </ul>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm text-gray-500">Chưa nhận được mã?</span>
            <button
              onClick={handleResend}
              disabled={!canResend}
              className={`text-sm font-medium flex items-center gap-1 ${
                canResend 
                  ? 'text-blue-600 hover:text-blue-700 cursor-pointer underline' 
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

          <button
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-2 w-full py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    );
  };

  return (
    <AuthLayout 
      title={verificationStatus === 'success' ? "" : "Xác thực Email"} 
      subtitle={verificationStatus === 'success' ? "" : "Vui lòng hoàn tất bước cuối cùng"}
    >
      {renderContent()}
    </AuthLayout>
  );
};

export default VerifyEmail;