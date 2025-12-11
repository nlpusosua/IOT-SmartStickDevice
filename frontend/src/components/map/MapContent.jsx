import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup, Polyline, useMap } from "react-leaflet";
import { Navigation } from "lucide-react";
import L from "leaflet";

// Fix icon mặc định cho Leaflet
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetina,
    iconUrl: iconMarker,
    shadowUrl: iconShadow,
});

// Component phụ để cập nhật View bản đồ
const MapUpdater = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom, { duration: 1.5 });
        }
    }, [center, zoom, map]);
    return null;
};

const MapContent = ({
    mapCenter,
    mapZoom,
    devices,
    handleDeviceClick,
    showGeofence,
    selectedDevice,
    setSelectedDevice,
    routePath,
    onGetDirection,
    userLocation
}) => {
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

                {/* Hiển thị đường đi (nếu có) */}
                {routePath && routePath.length > 0 && (
                    <Polyline 
                        positions={routePath} 
                        color="blue" 
                        weight={5} 
                        opacity={0.7} 
                    />
                )}

                {/* Vị trí người dùng */}
                {userLocation && (
                     <Marker 
                        position={userLocation}
                        icon={L.icon({
                            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                            shadowUrl: iconShadow,
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34]
                        })}
                    >
                        <Popup>
                            <p className="text-sm font-medium">📍 Vị trí của bạn</p>
                        </Popup>
                     </Marker>
                )}

                {/* Danh sách thiết bị */}
                {devices.map((device) => (
                    <React.Fragment key={device.id}>
                        <Marker
                            position={[device.location.lat, device.location.lng]}
                            eventHandlers={{
                                click: () => {
                                    handleDeviceClick(device);
                                }
                            }}
                        >
                            {/* POPUP LUÔN ĐƯỢC RENDER */}
                            <Popup>
                                <div className="min-w-[200px]">
                                    <h3 className="text-base font-semibold mb-2 text-gray-800">
                                        {device.name}
                                    </h3>
                                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                                        <p><strong>ID:</strong> {device.deviceToken}</p>
                                        <p>
                                            <strong>Trạng thái:</strong>{" "}
                                            <span className={device.status === 'online' ? "text-green-600" : "text-gray-500"}>
                                                {device.status === "online" ? "Online" : "Offline"}
                                            </span>
                                        </p>
                                        <p><strong>Cập nhật:</strong> {device.lastUpdate || 'N/A'}</p>
                                    </div>
                                    
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onGetDirection(device);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                        <Navigation size={14} />
                                        Chỉ đường đến đây
                                    </button>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Vùng an toàn (Geofence) */}
                        {showGeofence && (
                            <Circle
                                center={[device.location.lat, device.location.lng]}
                                radius={500}
                                pathOptions={{
                                    fillColor: device.geofence === "OUTSIDE" ? "#ff4444" : "#4CAF50",
                                    fillOpacity: 0.1,
                                    color: device.geofence === "OUTSIDE" ? "#ff4444" : "#4CAF50",
                                    weight: 1
                                }}
                            />
                        )}
                    </React.Fragment>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapContent;