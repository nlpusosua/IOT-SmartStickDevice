import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { updateDevice } from '../../service/deviceService';
import { toast } from 'react-toastify';

const EditDeviceModal = ({ isOpen, onClose, device, onSuccess }) => {
  const [deviceName, setDeviceName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (device) {
      setDeviceName(device.name);
    }
  }, [device]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!deviceName.trim()) {
      toast.warning('Vui lòng nhập tên thiết bị!');
      return;
    }

    setLoading(true);
    try {
      await updateDevice(device.id, deviceName);
      toast.success('Cập nhật thiết bị thành công!');
      onSuccess();
      onClose();
    } catch (error) {
      if (error.response?.data) {
        toast.error(error.response.data);
      } else {
        toast.error('Có lỗi xảy ra khi cập nhật thiết bị!');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !device) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Sửa thông tin thiết bị</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã thiết bị
            </label>
            <input
              type="text"
              value={device.deviceToken}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Mã thiết bị không thể thay đổi</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên thiết bị
            </label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="VD: Ông Nguyễn Văn A"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDeviceModal;