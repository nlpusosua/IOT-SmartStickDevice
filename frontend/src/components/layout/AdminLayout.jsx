import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Users, Smartphone, BarChart3, LogOut, Menu, X, Shield } from 'lucide-react';
import { logoutAPI } from '../../service/authService';
import { toast } from 'react-toastify';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logoutAPI();
      localStorage.clear();
      toast.success("Đăng xuất thành công");
      navigate('/login');
    } catch (error) {
      localStorage.clear();
      navigate('/login');
    }
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: <BarChart3 size={20} />, label: 'Thống kê' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Quản lý người dùng' },
    { path: '/admin/devices', icon: <Smartphone size={20} />, label: 'Quản lý thiết bị' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="h-16 flex items-center justify-center border-b border-slate-700">
            {sidebarOpen ? (
                <div className="flex items-center gap-2">
                    <Shield className="text-blue-400" />
                    <span className="font-bold text-xl">Admin Panel</span>
                </div>
            ) : (
                <Shield className="text-blue-400" />
            )}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
            {menuItems.map((item) => (
                <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg transition-colors ${
                        location.pathname === item.path 
                        ? 'bg-blue-600 text-white' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                    {item.icon}
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </button>
            ))}
        </nav>

        <div className="p-3 border-t border-slate-700">
            <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-lg text-red-400 hover:bg-slate-800 transition-colors"
            >
                <LogOut size={20} />
                {sidebarOpen && <span className="font-medium">Đăng xuất</span>}
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded">
                {sidebarOpen ? <X /> : <Menu />}
            </button>
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600">Administrator</span>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    A
                </div>
            </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
            <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;