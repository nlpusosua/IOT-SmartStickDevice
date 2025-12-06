// FRONTEND/src/components/device/DeviceModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

/**
 * Modal dùng chung cho Create và Edit Device
 * Props:
 * - isOpen: boolean - hiển thị modal
 * - onClose: function - đóng modal
 * - onSubmit: function - xử lý submit (create hoặc update)
 * - device: object | null - nếu có device thì là edit mode, null thì là create mode
 * - loading: boolean - trạng thái loading khi submit
 */
const DeviceModal = ({ isOpen, onClose, onSubmit, device = null, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    deviceToken: ''
  });
  const [errors, setErrors] = useState({});

  // Load dữ liệu device vào form khi edit
  useEffect(() => {
    if (device) {
      setFormData({
        name: device.name || '',
        deviceToken: device.deviceToken || ''
      });
    } else {
      setFormData({
        name: '',
        deviceToken: ''
      });
    }
    setErrors({});
  }, [device, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Xóa error khi user đang nhập
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên thiết bị không được để trống';
    }
    
    if (!formData.deviceToken.trim()) {
      newErrors.deviceToken = 'Device Token không được để trống';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              {device ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Tên thiết bị */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên thiết bị <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="VD: Ông Nguyễn Văn A"
                className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                disabled={loading}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Device Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device Token <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="deviceToken"
                value={formData.deviceToken}
                onChange={handleChange}
                placeholder="VD: SMARTCANE-0001"
                className={`w-full px-4 py-2 border ${errors.deviceToken ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                disabled={loading}
              />
              {errors.deviceToken && <p className="mt-1 text-sm text-red-600">{errors.deviceToken}</p>}
              <p className="mt-1 text-xs text-gray-500">
                Token duy nhất để nhận dạng thiết bị
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Đang xử lý...
                  </>
                ) : (
                  device ? 'Cập nhật' : 'Thêm mới'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default DeviceModal;