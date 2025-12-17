import React, { useState, useEffect } from 'react';
import { X, Circle, Plus, Edit2, Trash2, Power, Loader2, MapPin } from 'lucide-react';
import { getGeofencesByDevice, toggleGeofence, deleteGeofence } from '../../service/geofenceService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const GeofencePanel = ({ 
  device, 
  onClose, 
  onCreateGeofence,
  onEditGeofence,
  onRefresh,
  refreshTrigger,
  onGeofenceClick,
  onClearSelection // --- MỚI: Nhận prop này từ Dashboard ---
}) => {
  const [geofences, setGeofences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (device) {
      fetchGeofences();
    }
  }, [device, refreshTrigger]);

  const fetchGeofences = async () => {
    setLoading(true);
    try {
      const data = await getGeofencesByDevice(device.id);
      setGeofences(data);
    } catch (error) {
      console.error('Error fetching geofences:', error);
      toast.error('Không thể tải danh sách vùng an toàn');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (e, geofenceId) => {
    e.stopPropagation();
    setTogglingId(geofenceId);
    try {
      await toggleGeofence(geofenceId);
      toast.success('Đã thay đổi trạng thái vùng an toàn');
      fetchGeofences();
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error('Không thể thay đổi trạng thái');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (e, geofence) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: 'Xóa vùng an toàn?',
      text: `Bạn có chắc muốn xóa "${geofence.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Vâng, xóa!',
      cancelButtonText: 'Hủy',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    setDeletingId(geofence.id);
    try {
      await deleteGeofence(geofence.id);
      toast.success('Đã xóa vùng an toàn');
      fetchGeofences();
      if (onRefresh) onRefresh();
      
      // --- FIX: Gọi hàm dọn dẹp marker ---
      if (onClearSelection) onClearSelection(); 

    } catch (error) {
      toast.error('Không thể xóa vùng an toàn');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (e, geofence) => {
    e.stopPropagation();
    onEditGeofence(geofence);
  }

  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center gap-3">
          <Circle size={24} className="text-purple-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Vùng an toàn</h2>
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

      {/* Create Button */}
      <div className="px-5 py-4 border-b border-gray-200">
        <button
          onClick={() => onCreateGeofence(device)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          <Plus size={18} />
          Tạo vùng an toàn mới
        </button>
      </div>

      {/* Geofence List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-purple-600" size={32} />
          </div>
        ) : geofences.length === 0 ? (
          <div className="text-center py-8">
            <Circle size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Chưa có vùng an toàn</p>
            <p className="text-sm text-gray-400 mt-1">
              Tạo vùng để nhận cảnh báo
            </p>
          </div>
        ) : (
          geofences.map((geofence) => (
            <div
              key={geofence.id}
              // Click vào item chỉ focus bản đồ, ko set Editing nên marker xanh sẽ ko hiện (đúng ý đồ)
              onClick={() => onGeofenceClick && onGeofenceClick(geofence)}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
                geofence.active
                  ? 'border-purple-300 bg-purple-50 hover:bg-purple-100'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{geofence.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        geofence.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {geofence.active ? 'Đang bật' : 'Đã tắt'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleToggle(e, geofence.id)}
                  disabled={togglingId === geofence.id}
                  className={`p-2 rounded-lg transition-colors ${
                    geofence.active
                      ? 'bg-green-100 text-green-600 hover:bg-green-200'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  title={geofence.active ? "Tắt vùng an toàn" : "Bật vùng an toàn"}
                >
                  {togglingId === geofence.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Power size={16} />
                  )}
                </button>
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  <span>
                    {parseFloat(geofence.centerLatitude).toFixed(6)}, {parseFloat(geofence.centerLongitude).toFixed(6)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle size={14} />
                  <span>Bán kính: {geofence.radiusMeters}m</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => handleEdit(e, geofence)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <Edit2 size={14} />
                  Sửa
                </button>
                <button
                  onClick={(e) => handleDelete(e, geofence)}
                  disabled={deletingId === geofence.id}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {deletingId === geofence.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Footer */}
      <div className="px-5 py-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          <p className="font-medium text-gray-700 mb-1">💡 Hướng dẫn:</p>
          <ul className="space-y-1">
            <li>• Click vào vùng an toàn để xem trên bản đồ</li>
            <li>• Tạo nhiều vùng cho mỗi thiết bị</li>
            <li>• Bật/tắt vùng bất cứ lúc nào</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GeofencePanel;