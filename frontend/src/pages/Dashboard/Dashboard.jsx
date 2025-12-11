// pages/Dashboard/Dashboard.jsx
import React, { useState, useCallback, useEffect } from "react";
import { getMyDevices } from "../../service/deviceService";
import { toast } from 'react-toastify';
import axios from 'axios';

import Header from "../../components/common/Header";
import Sidebar from "../../components/common/Sidebar";
import MapContent from "../../components/map/MapContent";
import AddDeviceModal from "../../components/device/AddDeviceModal";
import EditDeviceModal from "../../components/device/EditDeviceModal";

const mockNotifications = [
  {
    id: 1,
    type: "sos",
    message: "Cảnh báo SOS từ Ông Lê Văn C",
    time: "5 phút trước",
    read: false,
  },
  {
    id: 2,
    type: "geofence",
    message: "Ông Lê Văn C đã rời khỏi vùng an toàn",
    time: "15 phút trước",
    read: false,
  },
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

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deviceToEdit, setDeviceToEdit] = useState(null);

  // Lấy danh sách devices từ API
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
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
      } else {
        toast.error('Không thể tải danh sách thiết bị!');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    
    // Lấy vị trí hiện tại của User
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          console.warn("Không thể lấy vị trí người dùng");
        }
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

  // --- Logic Tìm đường với GraphHopper ---
  const handleGetDirection = async (targetDevice) => {
    if (!userLocation) {
        if (navigator.geolocation) {
             navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const currentPos = [pos.coords.latitude, pos.coords.longitude];
                    setUserLocation(currentPos);
                    fetchRoute(currentPos, [targetDevice.location.lat, targetDevice.location.lng]);
                },
                (err) => {
                    toast.error("Vui lòng bật định vị trình duyệt để tìm đường!");
                }
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
          const res = await axios.get(url);
          
          if (res.data && res.data.paths && res.data.paths.length > 0) {
              const points = res.data.paths[0].points.coordinates;
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

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.deviceToken.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || device.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddDevice = () => {
    setShowAddModal(true);
  };

  const handleEditDevice = (device) => {
    setDeviceToEdit(device);
    setShowEditModal(true);
  };

  const handleAddSuccess = () => {
    fetchDevices();
  };

  const handleEditSuccess = () => {
    fetchDevices();
  };

  const handleDeleteSuccess = () => {
    setSelectedDevice(null);
    setRoutePath([]);
    fetchDevices();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <Header 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        notifications={notifications}
      />

      <div className="flex flex-1 overflow-hidden">
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
          onAddDevice={handleAddDevice}
          onEditDevice={handleEditDevice}
          onDeleteSuccess={handleDeleteSuccess}
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
              routePath={routePath}
              onGetDirection={handleGetDirection}
              userLocation={userLocation}
            />
          )}
        </main>
      </div>

      <AddDeviceModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      <EditDeviceModal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        device={deviceToEdit}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default SmartCaneDashboard;