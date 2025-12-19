import React, { useState, useEffect } from "react";
import { getMyDevices, getDeviceHistory } from "../../service/deviceService";
import { getUnreadAlerts } from "../../service/alertService";
import { toast } from "react-toastify";
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

import Header from "../../components/common/Header";
import Sidebar from "../../components/common/Sidebar";
import MapContent from "../../components/map/MapContent";
import AddDeviceModal from "../../components/device/AddDeviceModal";
import EditDeviceModal from "../../components/device/EditDeviceModal";
import HistoryPanel from "../../components/device/HistoryPanel";
import GeofenceModal from "../../components/device/GeofenceModal";
import GeofencePanel from "../../components/device/GeofencePanel";
import SOSPopup from "../../components/notification/SOSPopup";
import { createGeofence, updateGeofence } from "../../service/geofenceService";

const SmartCaneDashboard = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showGeofence, setShowGeofence] = useState(true);

  const [mapCenter, setMapCenter] = useState([21.028511, 105.804817]);
  const [mapZoom, setMapZoom] = useState(14);
  const [loading, setLoading] = useState(false);

  const [userLocation, setUserLocation] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  
  // PANEL STATES
  const [activePanel, setActivePanel] = useState(null); // 'history' | 'geofence' | null
  const [historyDevice, setHistoryDevice] = useState(null);
  const [historyPath, setHistoryPath] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deviceToEdit, setDeviceToEdit] = useState(null);

  // Geofence states
  const [showGeofenceModal, setShowGeofenceModal] = useState(false);
  const [geofenceDevice, setGeofenceDevice] = useState(null);
  const [editingGeofence, setEditingGeofence] = useState(null);
  const [loadingGeofence, setLoadingGeofence] = useState(false);
  const [pickingLocation, setPickingLocation] = useState(false);
  const [tempGeofenceData, setTempGeofenceData] = useState(null);
  const [geofenceUpdateTrigger, setGeofenceUpdateTrigger] = useState(0);

  const [sosPopup, setSOSPopup] = useState(null);
  const [stompClient, setStompClient] = useState(null);

  // --- HÀM RESET TẤT CẢ PANEL ---
  const resetAllPanels = () => {
    setActivePanel(null);
    setHistoryDevice(null);
    setHistoryPath([]);
    setGeofenceDevice(null);
    setEditingGeofence(null);
    setTempGeofenceData(null);
    setPickingLocation(false);
    setRoutePath([]);
  };

  // --- HÀM XỬ LÝ KHI CLICK HEADER (MỚI) ---
  const handleHeaderInteraction = () => {
      if (activePanel) {
          resetAllPanels();
      }
  };

  const getUserId = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.sub;
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  };

  // WebSocket Connection
  useEffect(() => {
    const userId = getUserId();
    if (!userId) {
      console.warn('No userId found, skipping WebSocket connection');
      return;
    }

    const socket = new SockJS('http://localhost:8080/ws');
    const client = Stomp.over(socket);
    
    client.connect({}, () => {
      console.log('✅ WebSocket connected for user:', userId);
      
      client.subscribe(`/topic/user/${userId}/alerts`, (message) => {
        const alert = JSON.parse(message.body);
        console.log('📢 New alert received:', alert);
        
        // Cập nhật State notification ngay lập tức
        setNotifications(prev => [alert, ...prev]);
        
        if (alert.alertType === 'SOS' || alert.alertType === 'LOST') {
          setSOSPopup(alert);
          try {
            const audio = new Audio('/alert-sound.mp3');
            audio.play().catch(e => console.log('Cannot play sound:', e));
          } catch (e) {
            console.log('Audio not available');
          }
        } else {
          toast.warning(alert.message, { autoClose: 5000 });
        }
      });
    }, (error) => {
      console.error('❌ WebSocket connection error:', error);
    });
    
    setStompClient(client);
    
    return () => {
      if (client && client.connected) {
        client.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getUnreadAlerts();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    fetchNotifications();
  }, []);

  const handleRefreshNotifications = async () => {
    try {
      const data = await getUnreadAlerts();
      setNotifications(data);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  const handleNotificationClick = (notif) => {
    resetAllPanels();
    handleLocateAlert(notif);
  };

  const handleLocateAlert = (alert) => {
    if (alert.latitude && alert.longitude) {
      setMapCenter([alert.latitude, alert.longitude]);
      setMapZoom(18);
      
      const device = devices.find(d => d.id === alert.deviceId);
      if (device) {
        setSelectedDevice(device);
      }
    }
  };

  const fetchDevices = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const response = await getMyDevices();
      const devicesData = response.map((device, index) => ({
        ...device,
        status: device.status?.toLowerCase() || "offline",
        location: device.location || {
          lat: 21.028511 + index * 0.01,
          lng: 105.804817 + index * 0.01,
        },
        sos: device.sos || false,
        geofence: device.geofence || "INSIDE",
      }));
      setDevices(devicesData);
    } catch (error) {
      console.error("Error fetching devices:", error);
      if (!isBackground) {
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn!");
        } else {
          toast.error("Không thể tải danh sách thiết bị!");
        }
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices(false);
    const intervalId = setInterval(() => {
      fetchDevices(true);
    }, 3000);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => console.warn("Không thể lấy vị trí người dùng")
      );
    }
    return () => clearInterval(intervalId);
  }, []);

  const handleDeviceClick = (device) => {
    resetAllPanels();
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
        const leafletPoints = points.map((p) => [p[1], p[0]]);
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

  const handleShowHistory = (device) => {
    resetAllPanels();
    setActivePanel('history');
    setHistoryDevice(device);
    setSelectedDevice(device);
  };

  const handleLoadHistory = async (deviceId, hours) => {
    setLoadingHistory(true);
    try {
      const response = await getDeviceHistory(deviceId, hours);
      if (response.path && response.path.length > 0) {
        const pathPoints = response.path.map((point) => [point.lat, point.lng]);
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
    setActivePanel(null);
    setHistoryDevice(null);
    setHistoryPath([]);
  };

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.deviceToken.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || device.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleRefreshData = () => {
    fetchDevices(false);
  };

  const handleManageGeofence = (device) => {
    resetAllPanels();
    setActivePanel('geofence');
    setGeofenceDevice(device);
    setSelectedDevice(device);
  };

  const handleCreateGeofence = (device) => {
    setGeofenceDevice(device);
    setEditingGeofence(null);
    setShowGeofenceModal(true);
  };

  const handleEditGeofence = (geofence) => {
    setEditingGeofence(geofence);
    setShowGeofenceModal(true);
  };

  const handleFocusGeofence = (geofence) => {
    const lat = parseFloat(geofence.centerLatitude);
    const lng = parseFloat(geofence.centerLongitude);
    if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter([lat, lng]);
        setMapZoom(16);
    }
  };

  const handleMapClick = (latlng) => {
    if (pickingLocation) {
      setPickingLocation(false);
      const updatedGeofence = {
        ...(tempGeofenceData || {}),
        centerLatitude: latlng.lat,
        centerLongitude: latlng.lng,
        id: editingGeofence ? editingGeofence.id : null,
        deviceId: editingGeofence ? editingGeofence.deviceId : null,
        createdAt: editingGeofence ? editingGeofence.createdAt : null
      };

      setEditingGeofence(updatedGeofence);
      setShowGeofenceModal(true);
      toast.success("Đã cập nhật tọa độ mới!");
    }
  };

  const handleSubmitGeofence = async (geofenceData) => {
    setLoadingGeofence(true);
    try {
      if (editingGeofence && editingGeofence.id) {
        await updateGeofence(editingGeofence.id, geofenceData);
        toast.success("Đã cập nhật vùng an toàn!");
      } else {
        await createGeofence(geofenceDevice.id, geofenceData);
        toast.success("Đã tạo vùng an toàn!");
      }
      setShowGeofenceModal(false);
      handleRefreshData();
      setGeofenceUpdateTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Geofence error:", error);
      toast.error("Không thể lưu vùng an toàn");
    } finally {
      setLoadingGeofence(false);
    }
  };

  const handleDeleteSuccess = (deletedDeviceId) => {
    if (selectedDevice?.id === deletedDeviceId || 
        historyDevice?.id === deletedDeviceId || 
        geofenceDevice?.id === deletedDeviceId) {
      resetAllPanels();
      setSelectedDevice(null);
    }
    handleRefreshData();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        notifications={notifications}
        onRefreshNotifications={handleRefreshNotifications}
        onNotificationClick={handleNotificationClick}
        onHeaderInteraction={handleHeaderInteraction} // <-- TRUYỀN HÀM XUỐNG
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
          onDeleteSuccess={handleDeleteSuccess}
          onShowHistory={handleShowHistory}
          onManageGeofence={handleManageGeofence}
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
              routePath={activePanel === 'history' ? historyPath : routePath}
              onGetDirection={handleGetDirection}
              userLocation={userLocation}
              onMapClick={handleMapClick}
              tempMarker={
                editingGeofence && editingGeofence.centerLatitude
                  ? { lat: editingGeofence.centerLatitude, lng: editingGeofence.centerLongitude }
                  : null
              }
            />
          )}
        </main>

        {activePanel === 'history' && historyDevice && (
          <HistoryPanel
            device={historyDevice}
            onClose={handleCloseHistory}
            onLoadHistory={handleLoadHistory}
            isLoading={loadingHistory}
          />
        )}

        {activePanel === 'geofence' && geofenceDevice && (
          <GeofencePanel
            device={geofenceDevice}
            onClose={() => {
                setActivePanel(null);
                setGeofenceDevice(null);
            }}
            onCreateGeofence={handleCreateGeofence}
            onEditGeofence={handleEditGeofence}
            onRefresh={handleRefreshData}
            refreshTrigger={geofenceUpdateTrigger}
            onGeofenceClick={handleFocusGeofence}
            onClearSelection={() => {
                setEditingGeofence(null);
                setTempGeofenceData(null);
                setPickingLocation(false);
            }}
          />
        )}
      </div>

      <AddDeviceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleRefreshData}
      />
      
      <EditDeviceModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        device={deviceToEdit}
        onSuccess={handleRefreshData}
      />

      {showGeofenceModal && (
        <GeofenceModal
          isOpen={showGeofenceModal}
          onClose={() => {
            setShowGeofenceModal(false);
            if (!pickingLocation) setEditingGeofence(null);
          }}
          onSubmit={handleSubmitGeofence}
          device={geofenceDevice}
          geofence={editingGeofence}
          loading={loadingGeofence}
          onPickLocation={(currentFormData) => {
            setTempGeofenceData(currentFormData);
            setPickingLocation(true);
            setShowGeofenceModal(false);
            toast.info("Hãy click vào vị trí mong muốn trên bản đồ");
          }}
        />
      )}

      {sosPopup && (
        <SOSPopup
          alert={sosPopup}
          onClose={() => setSOSPopup(null)}
          onLocate={handleLocateAlert}
        />
      )}
    </div>
  );
};

export default SmartCaneDashboard;