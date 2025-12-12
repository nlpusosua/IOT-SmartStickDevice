import React, { useState, useEffect } from "react";
import { getMyDevices, getDeviceHistory } from "../../service/deviceService";
import { toast } from 'react-toastify';

import Header from "../../components/common/Header";
import Sidebar from "../../components/common/Sidebar";
import MapContent from "../../components/map/MapContent";
import AddDeviceModal from "../../components/device/AddDeviceModal";
import EditDeviceModal from "../../components/device/EditDeviceModal";
import HistoryPanel from "../../components/device/HistoryPanel";

const mockNotifications = [
  { id: 1, type: "sos", message: "Cảnh báo SOS từ Ông Lê Văn C", time: "5 phút trước", read: false },
  { id: 2, type: "geofence", message: "Ông Lê Văn C đã rời khỏi vùng an toàn", time: "15 phút trước", read: false },
];

const SmartCaneDashboard = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState(mockNotifications);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showGeofence, setShowGeofence] = useState(true);

  const [mapCenter, setMapCenter] = useState([21.028511, 105.804817]); 
  const [mapZoom, setMapZoom] = useState(14);
  const [loading, setLoading] = useState(false);

  // Routing State
  const [userLocation, setUserLocation] = useState(null);
  const [routePath, setRoutePath] = useState([]);

  // History State (MỚI)
  const [historyMode, setHistoryMode] = useState(false);
  const [historyDevice, setHistoryDevice] = useState(null);
  const [historyPath, setHistoryPath] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deviceToEdit, setDeviceToEdit] = useState(null);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await getMyDevices();
      const devicesData = response.map((device, index)=> ({
        ...device,
        status: device.status?.toLowerCase() || 'offline',
        location: device.location || { 
          lat: 21.028511 + (index * 0.01),
          lng: 105.804817 + (index * 0.01)
        },
        sos: device.sos || false,
        geofence: device.geofence || 'INSIDE'
      }));
      setDevices(devicesData);
    } catch (error) {
      console.error('Error fetching devices:', error);
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn!');
      } else {
        toast.error('Không thể tải danh sách thiết bị!');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => console.warn("Không thể lấy vị trí người dùng")
      );
    }
  }, []);

  const handleDeviceClick = (device) => {
    setSelectedDevice(device);
    if (device.location) {
      setMapCenter([device.location.lat, device.location.lng]);
      setMapZoom(16);
    }
  };

  const handleGetDirection = async (targetDevice) => {
    if (!userLocation) {
        if (navigator.geolocation) {
             navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const currentPos = [pos.coords.latitude, pos.coords.longitude];
                    setUserLocation(currentPos);
                    fetchRoute(currentPos, [targetDevice.location.lat, targetDevice.location.lng]);
                },
                (err) => toast.error("Vui lòng bật định vị trình duyệt!")
            );
        } else {
            toast.error("Trình duyệt không hỗ trợ định vị!");
        }
        return;
    }
    
    fetchRoute(userLocation, [targetDevice.location.lat, targetDevice.location.lng]);
  };

  const fetchRoute = async (start, end) => {
      const apiKey = process.env.REACT_APP_GRAPHHOPPER_API_KEY;
      if (!apiKey) {
          toast.error("Chưa cấu hình API Key GraphHopper!");
          return;
      }

      const url = `https://graphhopper.com/api/1/route?point=${start[0]},${start[1]}&point=${end[0]},${end[1]}&vehicle=foot&locale=vi&key=${apiKey}&points_encoded=false`;

      try {
          toast.info("Đang tìm đường...");
          const response = await fetch(url);
          const data = await response.json();
          
          if (data?.paths?.length > 0) {
              const points = data.paths[0].points.coordinates;
              const leafletPoints = points.map(p => [p[1], p[0]]);
              
              setRoutePath(leafletPoints);
              setMapCenter(start);
              setMapZoom(14);
              toast.success("Đã tìm thấy đường đi!");
          } else {
              toast.warning("Không tìm thấy đường đi!");
          }
      } catch (error) {
          console.error("Routing error:", error);
          toast.error("Lỗi khi tìm đường!");
      }
  };

  // --- XỬ LÝ LỊCH SỬ (MỚI) ---
  const handleShowHistory = (device) => {
    setHistoryDevice(device);
    setHistoryMode(true);
    setRoutePath([]);
  };

  const handleLoadHistory = async (deviceId, hours) => {
    setLoadingHistory(true);
    try {
      const response = await getDeviceHistory(deviceId, hours);
      
      if (response.path && response.path.length > 0) {
        const pathPoints = response.path.map(point => [point.lat, point.lng]);
        setHistoryPath(pathPoints);
        
        setMapCenter([response.path[0].lat, response.path[0].lng]);
        setMapZoom(14);
        
        toast.success(`Đã tải ${response.totalPoints} điểm lịch sử`);
      } else {
        toast.warning("Không có dữ liệu lịch sử");
        setHistoryPath([]);
      }
    } catch (error) {
      console.error("History error:", error);
      toast.error("Không thể tải lịch sử di chuyển");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCloseHistory = () => {
    setHistoryMode(false);
    setHistoryDevice(null);
    setHistoryPath([]);
  };

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.deviceToken.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || device.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <Header 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        notifications={notifications}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          isOpen={sidebarOpen}
          devices={filteredDevices}
          selectedDevice={selectedDevice}
          onDeviceClick={handleDeviceClick}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          showGeofence={showGeofence}
          setShowGeofence={setShowGeofence}
          onAddDevice={() => setShowAddModal(true)}
          onEditDevice={(device) => {
            setDeviceToEdit(device);
            setShowEditModal(true);
          }}
          onDeleteSuccess={() => {
            setSelectedDevice(null);
            setRoutePath([]);
            fetchDevices();
          }}
          onShowHistory={handleShowHistory}
          loading={loading}
        />

        <main className="flex-1 relative z-0">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : (
            <MapContent 
              mapCenter={mapCenter}
              mapZoom={mapZoom}
              devices={filteredDevices}
              handleDeviceClick={handleDeviceClick}
              showGeofence={showGeofence}
              selectedDevice={selectedDevice}
              setSelectedDevice={setSelectedDevice}
              routePath={historyMode ? historyPath : routePath}
              onGetDirection={handleGetDirection}
              userLocation={userLocation}
              historyMode={historyMode}
            />
          )}
        </main>

        {historyMode && historyDevice && (
          <HistoryPanel
            device={historyDevice}
            onClose={handleCloseHistory}
            onLoadHistory={handleLoadHistory}
            isLoading={loadingHistory}
          />
        )}
      </div>

      <AddDeviceModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchDevices}
      />

      <EditDeviceModal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        device={deviceToEdit}
        onSuccess={fetchDevices}
      />
    </div>
  );
};

export default SmartCaneDashboard;