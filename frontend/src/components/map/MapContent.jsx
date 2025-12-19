import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  Polyline,
  Tooltip, // <-- IMPORT THÊM TOOLTIP
  useMap,
  useMapEvents,
} from "react-leaflet";
import { Navigation } from "lucide-react";
import L from "leaflet";
import { getGeofencesByDevice } from "../../service/geofenceService";
// Fix icon mặc định cho Leaflet
import iconMarker from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Định nghĩa Icon màu xanh lá cây (Green)
const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: iconMarker,
  shadowUrl: iconShadow,
});

// 1. Component phụ cập nhật View
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
};

// 2. Component phụ xử lý Click
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
};

const MapContent = ({
  mapCenter,
  mapZoom,
  devices,
  handleDeviceClick,
  showGeofence,
  selectedDevice, // <-- Cần cái này để lọc hiển thị
  setSelectedDevice,
  routePath,
  onGetDirection,
  userLocation,
  onMapClick,
  tempMarker,
}) => {
  const [geofencesData, setGeofencesData] = useState({});

  // Load geofences
  useEffect(() => {
    const loadGeofences = async () => {
      const data = {};
      for (const device of devices) {
        try {
          const geofences = await getGeofencesByDevice(device.id);
          data[device.id] = geofences.filter((g) => g.active);
        } catch (error) {
          console.error(
            `Error loading geofences for device ${device.id}:`,
            error
          );
        }
      }
      setGeofencesData(data);
    };
    if (devices.length > 0) {
      loadGeofences();
    }
  }, [devices]);

  return (
    <div className="w-full h-full z-0">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater center={mapCenter} zoom={mapZoom} />
        <MapClickHandler onMapClick={onMapClick} />

        {/* Đường đi chỉ dẫn */}
        {routePath && routePath.length > 0 && (
          <Polyline
            positions={routePath}
            color="blue"
            weight={5}
            opacity={0.7}
          />
        )}

        {/* Marker tạm thời khi chọn vị trí tạo geofence */}
        {tempMarker && (
          <Marker position={[tempMarker.lat, tempMarker.lng]} icon={greenIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-bold text-green-600">Vị trí đã chọn</p>
                <p className="text-xs">
                  {tempMarker.lat.toFixed(5)}, {tempMarker.lng.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Vị trí người dùng (User GPS) */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={L.icon({
              iconUrl:
                "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
              shadowUrl: iconShadow,
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
            })}
          >
            <Popup>
              <p className="text-sm font-medium">📍 Vị trí của bạn</p>
            </Popup>
          </Marker>
        )}

        {/* Loop Devices */}
        {devices.map((device) => {
          const deviceGeofences = geofencesData[device.id] || [];
          
          // --- LOGIC MỚI: Chỉ hiển thị vùng an toàn của thiết bị ĐANG ĐƯỢC CHỌN ---
          // Nếu không có thiết bị nào được chọn (selectedDevice === null) thì có thể ẩn hết hoặc hiện hết. 
          // Ở đây mình làm theo yêu cầu: Click vào device mới hiện.
          const isSelected = selectedDevice && selectedDevice.id === device.id;

          return (
            <React.Fragment key={device.id}>
              {/* Marker Thiết bị luôn hiện */}
              <Marker
                position={[device.location.lat, device.location.lng]}
                eventHandlers={{ click: () => handleDeviceClick(device) }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="text-base font-semibold mb-2 text-gray-800">
                      {device.name}
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1 mb-3">
                      <p>Trạng thái: {device.status}</p>
                      
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onGetDirection(device);
                      }}
                      className="w-full mt-2 px-3 py-1.5 bg-blue-600 text-white rounded text-sm"
                    >
                      <Navigation size={14} className="inline mr-1" /> Chỉ đường
                    </button>
                  </div>
                </Popup>
              </Marker>

              {/* Vòng tròn Geofence - Chỉ hiện khi showGeofence=true VÀ device đang được chọn */}
              {showGeofence && isSelected &&
                deviceGeofences.map((geofence) => (
                  <Circle
                    key={geofence.id}
                    center={[
                      parseFloat(geofence.centerLatitude),
                      parseFloat(geofence.centerLongitude),
                    ]}
                    radius={geofence.radiusMeters}
                    pathOptions={{
                      fillColor:
                        device.geofence === "OUTSIDE" ? "#ef4444" : "#8b5cf6", // Đã fix logic lấy field geofence
                      fillOpacity: 0.15,
                      color:
                        device.geofence === "OUTSIDE" ? "#ef4444" : "#8b5cf6",
                      weight: 2,
                      dashArray: "5, 5",
                    }}
                  >
                    {/* --- TÍNH NĂNG MỚI: Hiện tên vùng an toàn --- */}
                    {/* sticky: luôn hiện hoặc hiện khi hover. direction: hướng hiển thị */}
                    <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                        <div className="text-center">
                            <span className="font-bold text-purple-700">{geofence.name}</span> <br/>
                            <span className="text-xs text-gray-500">Bán kính: {geofence.radiusMeters}m</span>
                        </div>
                    </Tooltip>
                  </Circle>
                ))}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapContent;