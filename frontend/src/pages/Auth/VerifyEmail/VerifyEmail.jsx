import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, RefreshCw } from 'lucide-react';
import AuthLayout from '../AuthLayout';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10); // 10 giây như yêu cầu
  const [canResend, setCanResend] = useState(false);

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

  const handleResend = () => {
    if (!canResend) return;
    // Logic gọi API gửi lại mail
    setCountdown(10);
    setCanResend(false);
    alert("Đã gửi lại mã xác thực!");
  };

  return (
    <AuthLayout title="Xác thực Email" subtitle="Vui lòng kiểm tra hộp thư đến của bạn">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Chúng tôi đã gửi một liên kết/mã xác thực đến email <span className="font-semibold text-gray-900">user@example.com</span>. 
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
    </AuthLayout>
  );
};

export default VerifyEmail;