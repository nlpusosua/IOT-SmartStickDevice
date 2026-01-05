import React from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { markAsRead, markAllAsRead } from '../../service/alertService';
import { toast } from 'react-toastify';

const NotificationPanel = ({ notifications, onClose, onRefresh, onNotificationClick }) => {
  
  const handleMarkAsRead = async (alertId, e) => {
    e.stopPropagation();
    try {
      await markAsRead(alertId);
      onRefresh();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('Đã đánh dấu tất cả đã đọc');
      onRefresh();
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const getAlertIcon = (alertType) => {
    switch(alertType) {
      case 'GEOFENCE_BREACH':
        return <AlertCircle size={20} className="text-orange-500" />;
      case 'GEOFENCE_RETURN':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'SOS':
      case 'LOST':
         return <AlertCircle size={20} className="text-red-600 animate-pulse" />;
      default:
        return <AlertCircle size={20} className="text-blue-500" />;
    }
  };

  return (
    <div className="absolute top-full right-16 mt-2 w-96 max-h-[500px] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50">
      
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-base font-semibold">
          Thông báo ({notifications.filter(n => !n.isRead).length})
        </h3>
        <div className="flex items-center gap-2">
          {notifications.filter(n => !n.isRead).length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Đánh dấu đã đọc
            </button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded">
            <X size={20} />
          </button>
        </div>
      </div>
      
      {/* Notification List */}
      <div className="max-h-[440px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Không có thông báo mới</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onNotificationClick && onNotificationClick(notif)}
              className={`flex gap-3 px-5 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                notif.isRead ? "opacity-60" : "bg-blue-50"
              }`}
            >
              {getAlertIcon(notif.alertType)}
              
              <div className="flex-1">
                <p className="text-sm text-gray-800 mb-1">{notif.message}</p>
                <span className="text-xs text-gray-500">
                  {/* Backend giờ đã trả về đúng timestamp của sự kiện, hàm này sẽ hiển thị chuẩn */}
                  {formatDistanceToNow(new Date(notif.timestamp), { 
                    addSuffix: true, 
                    locale: vi 
                  })}
                </span>
              </div>
              
              {!notif.isRead && (
                <button
                  onClick={(e) => handleMarkAsRead(notif.id, e)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Đánh dấu
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;