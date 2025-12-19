import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, MapPin, Bell, User, ChevronDown, Settings, LogOut, Loader2 } from 'lucide-react';
import NotificationPanel from '../notification/NotificationPanel';
import { logoutAPI } from '../../service/authService';
import { toast } from 'react-toastify';

const Header = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  notifications, 
  onRefreshNotifications,
  onNotificationClick,
  onHeaderInteraction // <-- PROP MỚI
}) => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Xử lý click chuông
  const toggleNotification = () => {
    if (!notificationOpen) {
        // Nếu sắp mở -> gọi hàm cha để tắt panel dưới
        if (onHeaderInteraction) onHeaderInteraction();
        // Tắt menu user nếu đang mở
        setUserMenuOpen(false);
    }
    setNotificationOpen(!notificationOpen);
  };

  // Xử lý click User
  const toggleUserMenu = () => {
    if (!userMenuOpen) {
        // Nếu sắp mở -> gọi hàm cha để tắt panel dưới
        if (onHeaderInteraction) onHeaderInteraction();
        // Tắt menu notification nếu đang mở
        setNotificationOpen(false);
    }
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setIsLoggingOut(true);
    try {
      await logoutAPI();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('pendingVerificationEmail');
      toast.success("Đăng xuất thành công!");
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('pendingVerificationEmail');
      toast.info("Đã đăng xuất khỏi thiết bị này");
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserName = () => {
    return "Người chăm sóc";
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-5 relative z-50 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="flex items-center gap-3">
          <MapPin size={28} className="text-blue-600" />
          <span className="text-lg font-semibold text-gray-800">Smart Cane Tracker</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        
        {/* Nút chuông thông báo */}
        <button
          onClick={toggleNotification}
          className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <Bell size={22} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Menu Dropdown */}
        <div className="relative">
          <button
            onClick={toggleUserMenu}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            aria-label="User menu"
          >
            <User size={20} />
            <span className="text-sm">{getUserName()}</span>
            <ChevronDown size={16} />
          </button>

          {userMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
              <button 
                onClick={() => {
                  setUserMenuOpen(false);
                  toast.info("Chức năng đang phát triển");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <User size={18} />
                <span className="text-sm">Thông tin cá nhân</span>
              </button>

              <button 
                onClick={() => {
                  setUserMenuOpen(false);
                  toast.info("Chức năng đang phát triển");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <Settings size={18} />
                <span className="text-sm">Cài đặt</span>
              </button>

              <hr className="border-gray-200" />

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span className="text-sm">Đang đăng xuất...</span>
                  </>
                ) : (
                  <>
                    <LogOut size={18} />
                    <span className="text-sm">Đăng xuất</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notification Panel */}
      {notificationOpen && (
        <NotificationPanel 
          notifications={notifications}
          onClose={() => setNotificationOpen(false)}
          onRefresh={onRefreshNotifications}
          onNotificationClick={onNotificationClick}
        />
      )}
    </header>
  );
};

export default Header;