import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, MapPin, Bell, User, ChevronDown, Settings, LogOut } from 'lucide-react';
import NotificationPanel from '../notification/NotificationPanel';

const Header = ({ sidebarOpen, setSidebarOpen, notifications }) => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-5 relative z-50 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
          onClick={() => setNotificationOpen(!notificationOpen)}
          className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell size={22} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <User size={20} />
            <span className="text-sm">Người chăm sóc</span>
            <ChevronDown size={16} />
          </button>

          {userMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
              <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                <User size={18} />
                <span className="text-sm">Thông tin cá nhân</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                <Settings size={18} />
                <span className="text-sm">Cài đặt</span>
              </button>
              <hr className="border-gray-200" />
              <button
                onClick={() => navigate("/login")}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left text-red-600"
              >
                <LogOut size={18} />
                <span className="text-sm">Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {notificationOpen && (
        <NotificationPanel 
          notifications={notifications} 
          onClose={() => setNotificationOpen(false)} 
        />
      )}
    </header>
  );
};

export default Header;