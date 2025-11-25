import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

const DeviceList = ({ devices, selectedDevice, onDeviceClick }) => {
  return (
    <div className="flex-1 overflow-y-auto p-3">
      {devices.map((device) => (
        <div
          key={device.id}
          onClick={() => onDeviceClick(device)}
          className={`mb-3 p-4 rounded-xl cursor-pointer transition-all ${
            device.sos
              ? "bg-red-50 border-2 border-red-500"
              : selectedDevice?.id === device.id
              ? "bg-blue-50 border-2 border-blue-500"
              : "bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-md"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                {device.name}
              </h3>
              <span className="text-xs text-gray-500">{device.deviceId}</span>
            </div>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                device.status === "online"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {device.status === "online" ? "Online" : "Offline"}
            </span>
          </div>

          <div className="flex items-center gap-4 mb-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={16} />
              <span>{device.lastUpdate}</span>
            </div>
          </div>

          {device.sos && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold">
              <AlertCircle size={16} />
              <span>CẢNH BÁO SOS!</span>
            </div>
          )}

          {device.geofence === "OUTSIDE" && !device.sos && (
            <div className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold">
              <AlertCircle size={16} />
              <span>Ngoài vùng an toàn</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DeviceList;