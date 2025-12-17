import React, { useState, useEffect } from "react";
import { getMyDevices, getDeviceHistory } from "../../service/deviceService";
import { toast } from "react-toastify";

import Header from "../../components/common/Header";
import Sidebar from "../../components/common/Sidebar";
import MapContent from "../../components/map/MapContent";
import AddDeviceModal from "../../components/device/AddDeviceModal";
import EditDeviceModal from "../../components/device/EditDeviceModal";
import HistoryPanel from "../../components/device/HistoryPanel";
import GeofenceModal from "../../components/device/GeofenceModal";
import GeofencePanel from "../../components/device/GeofencePanel";
import { createGeofence, updateGeofence } from "../../service/geofenceService";

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
  
  // History State
  const [historyMode, setHistoryMode] = useState(false);
  const [historyDevice, setHistoryDevice] = useState(null);
  const [historyPath, setHistoryPath] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deviceToEdit, setDeviceToEdit] = useState(null);

  // Geofence states
  const [showGeofenceModal, setShowGeofenceModal] = useState(false);
  const [showGeofencePanel, setShowGeofencePanel] = useState(false);
  const [geofenceDevice, setGeofenceDevice] = useState(null);
  const [editingGeofence, setEditingGeofence] = useState(null);
  const [loadingGeofence, setLoadingGeofence] = useState(false);
  const [pickingLocation, setPickingLocation] = useState(false);
  const [tempGeofenceData, setTempGeofenceData] = useState(null);

  const [geofenceUpdateTrigger, setGeofenceUpdateTrigger] = useState(0);

  // --- HÀM PHỤ TRỢ: RESET STATE GEOFENCE ---
  const resetGeofenceState = () => {
    setEditingGeofence(null);
    setTempGeofenceData(null);
    setPickingLocation(false);
    // Đảm bảo đóng panel luôn ở đây nếu cần, hoặc để ở logic gọi
  };

  // --- HÀM PHỤ TRỢ: RESET STATE HISTORY (MỚI) ---
  const resetHistoryState = () => {
    setHistoryMode(false);
    setHistoryDevice(null);
    setHistoryPath([]);
  };

  // --- 1. HÀM FETCH DEVICES ---
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

  // --- 2. POLLING ---
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

  // --- XỬ LÝ CLICK DEVICE (MỚI: Đóng tất cả các Panel) ---
  const handleDeviceClick = (device) => {
    setSelectedDevice(device);
    
    // 1. Đóng và Reset Geofence
    setShowGeofencePanel(false); 
    resetGeofenceState(); 

    // 2. Đóng và Reset History (Thêm dòng này)
    resetHistoryState();
    
    // 3. Zoom map
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

  // --- HISTORY (MỚI: Đóng Geofence khi mở History) ---
  const handleShowHistory = (device) => {
    // Đóng Geofence trước
    setShowGeofencePanel(false);
    resetGeofenceState();

    // Mở History
    setHistoryDevice(device);
    setHistoryMode(true);
    setRoutePath([]);
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
    resetHistoryState(); // Dùng hàm chung cho gọn
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

  // --- GEOFENCE LOGIC (MỚI: Đóng History khi mở Geofence) ---
  const handleManageGeofence = (device) => {
    // Đóng History trước
    resetHistoryState();

    // Mở Geofence
    setGeofenceDevice(device);
    setSelectedDevice(device);
    setShowGeofencePanel(true);
    resetGeofenceState();
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

  // --- XỬ LÝ CLICK BẢN ĐỒ (CHỌN TỌA ĐỘ) ---
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
            handleRefreshData();
          }}
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
              routePath={historyMode ? historyPath : routePath}
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

        {historyMode && historyDevice && (
          <HistoryPanel
            device={historyDevice}
            onClose={handleCloseHistory}
            onLoadHistory={handleLoadHistory}
            isLoading={loadingHistory}
          />
        )}

        {showGeofencePanel && geofenceDevice && (
          <GeofencePanel
            device={geofenceDevice}
            onClose={() => {
                setShowGeofencePanel(false);
                resetGeofenceState();
            }}
            onCreateGeofence={handleCreateGeofence}
            onEditGeofence={handleEditGeofence}
            onRefresh={handleRefreshData}
            refreshTrigger={geofenceUpdateTrigger}
            onGeofenceClick={handleFocusGeofence}
            onClearSelection={resetGeofenceState}
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
    </div>
  );
};

export default SmartCaneDashboard;