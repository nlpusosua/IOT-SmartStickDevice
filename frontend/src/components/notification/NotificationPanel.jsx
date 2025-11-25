import React from 'react';
import { X, AlertCircle } from 'lucide-react';

const NotificationPanel = ({ notifications, onClose }) => {
  return (
    <div className="absolute top-full right-16 mt-2 w-96 max-h-[500px] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
        <h3 className="text-base font-semibold">Thông báo</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X size={20} />
        </button>
      </div>
      <div className="max-h-[440px] overflow-y-auto">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`flex gap-3 px-5 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
              notif.read ? "opacity-60" : ""
            }`}
          >
            <AlertCircle
              size={20}
              className={`flex-shrink-0 mt-1 ${
                notif.type === "sos"
                  ? "text-red-500"
                  : notif.type === "geofence"
                  ? "text-orange-500"
                  : "text-blue-500"
              }`}
            />
            <div className="flex-1">
              <p className="text-sm text-gray-800 mb-1">{notif.message}</p>
              <span className="text-xs text-gray-500">{notif.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPanel;