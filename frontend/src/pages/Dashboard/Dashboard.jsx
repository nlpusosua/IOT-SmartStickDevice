import React, { useState, useCallback } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

// Import các component đã tách
import Header from "../../components/common/Header";
import Sidebar from "../../components/common/Sidebar";
import MapContent from "../../components/map/MapContent";

// Mock data (Có thể tách ra file utils/mockData.js nếu muốn)
const mockDevices = [
  {
    id: 1,
    deviceId: "SMARTCANE-0001",
    name: "Ông Nguyễn Văn A",
    status: "online",
    location: { lat: 21.028511, lng: 105.804817 },
    lastUpdate: "2 phút trước",
    sos: false,
    geofence: "INSIDE",
  },
  {
    id: 2,
    deviceId: "SMARTCANE-0002",
    name: "Bà Trần Thị B",
    status: "online",
    location: { lat: 21.030511, lng: 105.806817 },
    lastUpdate: "5 phút trước",
    sos: false,
    geofence: "INSIDE",
  },
  {
    id: 3,
    deviceId: "SMARTCANE-0003",
    name: "Ông Lê Văn C",
    status: "offline",
    location: { lat: 21.025511, lng: 105.802817 },
    lastUpdate: "1 giờ trước",
    sos: true,
    geofence: "OUTSIDE",
  },
];

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
  const [devices, setDevices] = useState(mockDevices);
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

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // Nhớ thay API Key của bạn
  });

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
    setMapCenter(device.location);
    setMapZoom(16);
  };

  const handleMapClick = useCallback(() => {
    setSelectedDevice(null);
  }, []);

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.deviceId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || device.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getMarkerIcon = (device) => {
    if (device.sos) return "http://maps.google.com/mapfiles/ms/icons/red-dot.png"; // Bạn có thể thay bằng icon local
    if (device.status === "offline") return "http://maps.google.com/mapfiles/ms/icons/grey-dot.png";
    if (device.geofence === "OUTSIDE") return "http://maps.google.com/mapfiles/ms/icons/orange-dot.png";
    return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
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
        />

        <main className="flex-1 relative">
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
        </main>
      </div>
    </div>
  );
};

export default SmartCaneDashboard;