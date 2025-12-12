import React, { useState } from 'react';
import { X, History, Clock, Calendar, MapPin, Loader2 } from 'lucide-react';

const HistoryPanel = ({ 
  device, 
  onClose, 
  onLoadHistory, 
  isLoading 
}) => {
  const [timeRange, setTimeRange] = useState('24'); // hours

  const handleLoadHistory = () => {
    onLoadHistory(device.id, parseInt(timeRange));
  };

  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="flex items-center gap-3">
          <History size={24} className="text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Lịch sử di chuyển</h2>
            <p className="text-sm text-gray-600">{device.name}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Device Info */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={16} className="text-blue-600" />
            <span className="font-medium">Thiết bị:</span>
            <span>{device.deviceToken}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={16} className="text-green-600" />
            <span className="font-medium">Trạng thái:</span>
            <span className={device.status === 'online' ? 'text-green-600' : 'text-gray-500'}>
              {device.status === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Time Range Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            <Calendar size={16} className="inline mr-2" />
            Chọn khoảng thời gian
          </label>
          
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: '1', label: '1 giờ' },
              { value: '3', label: '3 giờ' },
              { value: '6', label: '6 giờ' },
              { value: '12', label: '12 giờ' },
              { value: '24', label: '24 giờ' },
              { value: '72', label: '3 ngày' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Load Button */}
        <button
          onClick={handleLoadHistory}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Đang tải...
            </>
          ) : (
            <>
              <History size={18} />
              Xem lịch sử
            </>
          )}
        </button>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
          <p className="font-medium text-blue-800 mb-2">💡 Hướng dẫn:</p>
          <ul className="space-y-1 text-gray-600">
            <li>• Chọn khoảng thời gian muốn xem</li>
            <li>• Nhấn "Xem lịch sử" để hiển thị đường đi</li>
            <li>• Đường màu xanh trên bản đồ là quỹ đạo</li>
            <li>• Tắt chế độ để ẩn lịch sử</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;