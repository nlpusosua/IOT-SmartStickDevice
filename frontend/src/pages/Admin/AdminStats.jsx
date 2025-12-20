import React, { useEffect, useState } from 'react';
import { Users, Smartphone, Wifi, AlertTriangle, Loader2 } from 'lucide-react';
import { 
    getAdminStats, 
    getUserGrowthStats, 
    getDeviceStatusStats 
} from '../../service/adminService';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

// Component thẻ thống kê nhỏ (giữ nguyên)
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [userChartData, setUserChartData] = useState([]);
  const [deviceChartData, setDeviceChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Màu cho biểu đồ tròn (Pie Chart)
  const COLORS = ['#10b981', '#9ca3af']; // Xanh (Online), Xám (Offline)

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
        // Gọi song song 3 API để tiết kiệm thời gian
        const [generalStats, userGrowth, deviceStatus] = await Promise.all([
            getAdminStats(),
            getUserGrowthStats(),
            getDeviceStatusStats()
        ]);

        setStats(generalStats);
        setUserChartData(userGrowth);
        setDeviceChartData(deviceStatus);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Tổng quan hệ thống</h2>
      
      {/* 1. Các thẻ thống kê số liệu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Tổng người dùng" 
          value={stats?.totalUsers || 0} 
          icon={Users} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Tổng thiết bị" 
          value={stats?.totalDevices || 0} 
          icon={Smartphone} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Thiết bị Online" 
          value={stats?.onlineDevices || 0} 
          icon={Wifi} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Cảnh báo hoạt động" 
          value={stats?.activeAlerts || 0} 
          icon={AlertTriangle} 
          color="bg-red-500" 
        />
      </div>

      {/* 2. Khu vực Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Biểu đồ 1: Tăng trưởng người dùng (Area Chart) - Chiếm 2 phần */}
         <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Người dùng mới (6 tháng qua)</h3>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userChartData}>
                        <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#3b82f6" 
                            fillOpacity={1} 
                            fill="url(#colorUsers)" 
                            name="Người dùng mới"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
         </div>

         {/* Biểu đồ 2: Trạng thái thiết bị (Pie Chart) - Chiếm 1 phần */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Trạng thái thiết bị</h3>
            <div className="h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={deviceChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="label"
                        >
                            {deviceChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminStats;