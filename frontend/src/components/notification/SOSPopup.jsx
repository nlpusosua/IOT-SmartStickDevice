import React, { useEffect } from 'react';
import { X, AlertCircle, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';

const SOSPopup = ({ alert, onClose, onLocate }) => {
  const isLost = alert.alertType === 'LOST';
  
  useEffect(() => {
    // Auto close sau 30 giây (nếu không phải SOS)
    if (isLost) {
      const timer = setTimeout(onClose, 30000);
      return () => clearTimeout(timer);
    }
  }, [isLost, onClose]);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-[9999]" onClick={onClose} />
      
      {/* Popup */}
      <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10000] w-full max-w-md ${
        isLost ? 'bg-orange-50' : 'bg-red-50'
      } border-4 ${
        isLost ? 'border-orange-500' : 'border-red-600'
      } rounded-2xl shadow-2xl animate-pulse-slow`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 ${
          isLost ? 'bg-orange-500' : 'bg-red-600'
        } text-white`}>
          <div className="flex items-center gap-3">
            <AlertCircle size={32} className="animate-bounce" />
            <div>
              <h2 className="text-xl font-bold">
                {isLost ? '📍 THIẾT BỊ MẤT' : '🚨 CẢNH BÁO KHẨN CẤP'}
              </h2>
              <p className="text-sm opacity-90">
                {alert.deviceName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-lg font-semibold text-gray-800">
            {alert.message}
          </p>

          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{format(new Date(alert.timestamp), 'HH:mm:ss - dd/MM/yyyy')}</span>
            </div>
            
            {alert.latitude && alert.longitude && (
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>
                  {alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                onLocate(alert);
                onClose();
              }}
              className={`flex-1 px-4 py-3 ${
                isLost ? 'bg-orange-600 hover:bg-orange-700' : 'bg-red-600 hover:bg-red-700'
              } text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2`}
            >
              <MapPin size={18} />
              Xem vị trí
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SOSPopup;