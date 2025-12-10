import React from "react";
import { GoogleMap, Marker, Circle, InfoWindow } from "@react-google-maps/api";
import { Navigation } from "lucide-react";

const MapContent = ({
  isLoaded,
  mapContainerStyle,
  mapCenter,
  mapZoom,
  mapOptions,
  handleMapClick,
  devices,
  getMarkerIcon,
  handleDeviceClick,
  showGeofence,
  selectedDevice,
  setSelectedDevice,
}) => {
  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        Đang tải bản đồ...
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={mapCenter}
      zoom={mapZoom}
      options={mapOptions}
      onClick={handleMapClick}
    >
      {devices.map((device) => (
        <React.Fragment key={device.id}>
          <Marker
            position={device.location}
            icon={getMarkerIcon(device)}
            onClick={() => {
              handleDeviceClick(device); // Gọi hàm handle -> OK
            }}
          />

          {showGeofence && (
            <Circle
              center={device.location}
              radius={500}
              options={{
                fillColor:
                  device.geofence === "OUTSIDE" ? "#ff4444" : "#4CAF50",
                fillOpacity: 0.1,
                strokeColor:
                  device.geofence === "OUTSIDE" ? "#ff4444" : "#4CAF50",
                strokeOpacity: 0.5,
                strokeWeight: 2,
                clickable: false, // Nên thêm: Để chuột không bị vướng vào vòng tròn khi click map
              }}
            />
          )}

          {selectedDevice?.id === device.id && (
            <InfoWindow
              position={device.location}
              onCloseClick={() => setSelectedDevice(null)}
            >
              <div className="p-3 min-w-[200px]">
                <h3 className="text-base font-semibold mb-3 text-gray-800">
                  {device.name}
                </h3>
                <div className="space-y-2 text-sm text-gray-600 mb-3">
                  <p>
                    <strong>Device Token:</strong> {device.deviceToken}
                  </p>

                  <p>
                    <strong>Trạng thái:</strong>{" "}
                    {device.status === "online" ? "Online" : "Offline"}
                  </p>
                  <p>
                    <strong>Cập nhật:</strong> {device.lastUpdate}
                  </p>
                </div>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
                  <Navigation size={16} />
                  Chỉ đường
                </button>
              </div>
            </InfoWindow>
          )}
        </React.Fragment>
      ))}
    </GoogleMap>
  );
};

export default MapContent;
