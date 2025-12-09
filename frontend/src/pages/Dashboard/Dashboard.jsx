import React, { useState, useCallback, useEffect } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { getMyDevices } from "../../service/deviceService";
import { toast } from 'react-toastify';

// Import các component
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
  const [mapCenter, setMapCenter] = useState({
    lat: 21.028511,
    lng: 105.804817,
  });
  const [mapZoom, setMapZoom] = useState(14);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deviceToEdit, setDeviceToEdit] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyAYnKlrmZcmNK8TJme_TAsaJUnOYx3q4kU",
  });

  // Lấy danh sách devices từ API
  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await getMyDevices();
      
      // Convert status từ backend (ONLINE/OFFLINE) sang frontend (online/offline)
      const devicesData = response.map((device, index)=> ({
        ...device,
        status: device.status?.toLowerCase() || 'offline',
        // Mock location data - Bạn sẽ lấy từ API Location sau
        location: device.location || { 
          lat: 21.028511 + (index * 0.0099), // Mỗi thiết bị cách nhau 1 chút, nhưng CỐ ĐỊNH
          lng: 105.804817 + (index * 0.0099)
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
  }, []);

  const mapContainerStyle = {
    width: "100%",
    height: "100%",
  };

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
    ],
  };

  const handleDeviceClick = (device) => {
    setSelectedDevice(device);
    if (device.location) {
      setMapCenter(device.location);
      setMapZoom(16);
    }
  };

  const handleMapClick = useCallback(() => {
    setSelectedDevice(null);
  }, []);

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.deviceToken.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || device.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getMarkerIcon = (device) => {
    if (device.sos) return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
    if (device.geofence === "OUTSIDE") return "http://maps.google.com/mapfiles/ms/icons/orange-dot.png";
    return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
  };

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
    setSelectedDevice(null); // Clear selected device khi xóa
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

        <main className="flex-1 relative">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : (
            <MapContent 
              isLoaded={isLoaded}
              mapContainerStyle={mapContainerStyle}
              mapCenter={mapCenter}
              mapZoom={mapZoom}
              mapOptions={mapOptions}
              handleMapClick={handleMapClick}
              devices={filteredDevices}
              getMarkerIcon={getMarkerIcon}
              handleDeviceClick={handleDeviceClick}
              showGeofence={showGeofence}
              selectedDevice={selectedDevice}
              setSelectedDevice={setSelectedDevice}
            />
          )}
        </main>
      </div>

      {/* Modals */}
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