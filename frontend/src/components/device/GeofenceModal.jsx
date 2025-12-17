import React, { useState, useEffect } from "react";
import { X, MapPin, Save, Loader2, Circle } from "lucide-react";

const GeofenceModal = ({
  isOpen,
  onClose,
  onSubmit,
  device,
  geofence = null,
  loading = false,
  onPickLocation
}) => {
  const [formData, setFormData] = useState({
    name: "",
    centerLatitude: "",
    centerLongitude: "",
    radiusMeters: 500,
    active: true,
  });
  const [errors, setErrors] = useState({});
  const [isPickingLocation, setIsPickingLocation] = useState(false);

  useEffect(() => {
    if (geofence) {
      // Edit mode
      setFormData({
        name: geofence.name || "",
        centerLatitude: geofence.centerLatitude || "",
        centerLongitude: geofence.centerLongitude || "",
        radiusMeters: geofence.radiusMeters || 500,
        active: geofence.active !== undefined ? geofence.active : true,
      });
    } else if (device && device.location) {
      // Create mode - mặc định lấy vị trí hiện tại của device
      setFormData({
        name: `Vùng an toàn ${device.name}`,
        centerLatitude: device.location.lat,
        centerLongitude: device.location.lng,
        radiusMeters: 500,
        active: true,
      });
    } else {
      setFormData({
        name: "",
        centerLatitude: "",
        centerLongitude: "",
        radiusMeters: 500,
        active: true,
      });
    }
    setErrors({});
  }, [geofence, device, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên vùng an toàn được để trống";
    }

    const lat = parseFloat(formData.centerLatitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      newErrors.centerLatitude = "Vĩ độ không hợp lệ (-90 đến 90)";
    }

    const lng = parseFloat(formData.centerLongitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      newErrors.centerLongitude = "Kinh độ không hợp lệ (-180 đến 180)";
    }

    const radius = parseInt(formData.radiusMeters);
    if (isNaN(radius) || radius < 50 || radius > 5000) {
      newErrors.radiusMeters = "Bán kính phải từ 50m đến 5000m";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      ...formData,
      centerLatitude: parseFloat(formData.centerLatitude),
      centerLongitude: parseFloat(formData.centerLongitude),
      radiusMeters: parseInt(formData.radiusMeters),
    });
  };

  const handlePickLocation = () => {
    // Validate form cơ bản để không mất tên/bán kính đã nhập
    if (onPickLocation) {
        // Gửi toàn bộ dữ liệu đang nhập ra ngoài Dashboard lưu tạm
        onPickLocation({
            ...formData,
            // Đảm bảo gửi số (nếu user đã nhập) hoặc chuỗi rỗng
            radiusMeters: parseInt(formData.radiusMeters) || 500
        }); 
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center gap-3">
              <Circle className="text-purple-600" size={24} />
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {geofence ? "Chỉnh sửa vùng an toàn" : "Tạo vùng an toàn"}
                </h2>
                {device && (
                  <p className="text-sm text-gray-600">{device.name}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-1 hover:bg-white rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-5 max-h-[70vh] overflow-y-auto"
          >
            {/* Tên vùng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên vùng an toàn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="VD: Nhà của bà, Công viên gần nhà"
                className={`w-full px-4 py-2 border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
                disabled={loading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Tọa độ tâm */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vĩ độ (Lat) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.000001"
                  name="centerLatitude"
                  value={formData.centerLatitude}
                  onChange={handleChange}
                  placeholder="21.028511"
                  className={`w-full px-4 py-2 border ${
                    errors.centerLatitude ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
                  disabled={loading}
                />
                {errors.centerLatitude && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.centerLatitude}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kinh độ (Lng) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.000001"
                  name="centerLongitude"
                  value={formData.centerLongitude}
                  onChange={handleChange}
                  placeholder="105.804817"
                  className={`w-full px-4 py-2 border ${
                    errors.centerLongitude
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
                  disabled={loading}
                />
                {errors.centerLongitude && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.centerLongitude}
                  </p>
                )}
              </div>
            </div>

            {/* Nút chọn tọa độ trên bản đồ */}
            <button
              type="button"
              onClick={handlePickLocation}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium disabled:opacity-50"
            >
              <MapPin size={18} />
              Chọn tọa độ trên bản đồ
            </button>

            {/* Bán kính */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bán kính (mét) <span className="text-red-500">*</span>
              </label>
              <input
                type="range"
                name="radiusMeters"
                min="50"
                max="2000"
                step="50"
                value={formData.radiusMeters}
                onChange={handleChange}
                disabled={loading}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">50m</span>
                <span className="text-lg font-semibold text-purple-600">
                  {formData.radiusMeters}m
                </span>
                <span className="text-sm text-gray-600">2000m</span>
              </div>
              {errors.radiusMeters && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.radiusMeters}
                </p>
              )}
            </div>

            {/* Trạng thái kích hoạt */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">
                  Kích hoạt vùng an toàn
                </p>
                <p className="text-sm text-gray-600">
                  Bật để nhận cảnh báo khi rời khỏi vùng
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  disabled={loading}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-medium text-blue-800 mb-2">💡 Lưu ý:</p>
              <ul className="space-y-1 text-gray-600">
                <li>• Vùng an toàn giúp bạn theo dõi di chuyển</li>
                <li>• Bạn sẽ nhận thông báo khi thiết bị rời khỏi vùng</li>
                <li>• Có thể tạo nhiều vùng cho mỗi thiết bị</li>
                <li>• Bật/tắt vùng bất cứ lúc nào</li>
              </ul>
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
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {geofence ? "Cập nhật" : "Tạo vùng"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default GeofenceModal;
