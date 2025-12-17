import Swal from "sweetalert2";
import React, { useState } from "react";
import { Clock, AlertCircle, Edit2, Trash2, History } from "lucide-react";
import { removeDevice } from "../../service/deviceService";
import { toast } from "react-toastify";
import { deleteDevice } from "../../service/deviceService";
import { Circle } from "lucide-react";

const DeviceList = ({
  devices,
  selectedDevice,
  onDeviceClick,
  onEdit,
  onDeleteSuccess,
  onShowHistory,
  onManageGeofence,
}) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleRemove = async (e, device) => {
    e.stopPropagation();

    // 1. Thay window.confirm bằng Swal
    const result = await Swal.fire({
      title: "Gỡ bỏ thiết bị?",
      text: `Bạn có chắc muốn gỡ "${device.name}"? Thiết bị sẽ quay về kho.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33", // Màu đỏ cho nút Xóa
      cancelButtonColor: "#3085d6", // Màu xanh cho nút Hủy
      confirmButtonText: "Vâng, gỡ bỏ!",
      cancelButtonText: "Hủy",
      reverseButtons: true,
      // THÊM DÒNG NÀY: Đảm bảo Swal sử dụng style mặc định của nó
      buttonsStyling: true,
      // Tùy chọn thêm để đẹp hơn
      reverseButtons: true, // Đảo nút Hủy lên trước để tránh bấm nhầm
    });

    // Nếu người dùng bấm Hủy hoặc click ra ngoài
    if (!result.isConfirmed) {
      return;
    }

    setDeletingId(device.id);

    try {
      await removeDevice(device.id);

      // 2. Vẫn giữ Toast cho thông báo thành công (UX mượt hơn)
      toast.success("Đã gỡ bỏ thiết bị thành công!");

      // Nếu bạn muốn dùng Swal cho thông báo thành công luôn (tùy chọn):
      await Swal.fire("Đã gỡ!", "Thiết bị đã được gỡ bỏ.", "success");

      onDeleteSuccess();
    } catch (error) {
      // Xử lý lỗi
      const errorMessage =
        error.response?.data && typeof error.response.data === "string"
          ? error.response.data
          : "Có lỗi xảy ra khi gỡ bỏ thiết bị!";

      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (e, device) => {
    e.stopPropagation();
    onEdit(device);
  };

  const formatLastUpdate = (lastUpdate) => {
    if (!lastUpdate) return "Chưa cập nhật";
    const date = new Date(lastUpdate);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return `${diff} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-3">
      {devices.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="font-medium">Chưa có thiết bị nào</p>
          <p className="text-sm mt-2">Nhấn nút "+" để kích hoạt thiết bị</p>
        </div>
      ) : (
        devices.map((device) => (
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
            {/* --- PHẦN HEADER (Tên & Trạng thái) --- */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">
                  {device.name}
                </h3>
                <span className="text-xs text-gray-500">
                  {device.deviceToken}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    device.status === "online"
                      ? "bg-green-200 text-green-800 border-green-300 shadow-[0_0_10px_rgba(74,222,128,0.3)]"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                  }`}
                >
                  {device.status === "online" ? "Online" : "Offline"}
                </span>
              </div>
            </div>

            {/* --- THÔNG TIN THỜI GIAN & CẢNH BÁO --- */}
            {/* Mình đưa phần này lên trên nút bấm cho đẹp hơn */}
            <div className="flex items-center gap-4 mb-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={16} />
                <span>{formatLastUpdate(device.lastUpdate)}</span>
              </div>
            </div>

            {device.sos && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold mb-3">
                <AlertCircle size={16} />
                <span>CẢNH BÁO SOS!</span>
              </div>
            )}

            {device.geofence === "OUTSIDE" && !device.sos && (
              <div className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold mb-3">
                <AlertCircle size={16} />
                <span>Ngoài vùng an toàn</span>
              </div>
            )}

            {/* --- NÚT HÀNH ĐỘNG (Lịch sử - Sửa - Xóa) --- */}
            {/* Chỉ giữ lại 1 cụm này thôi, mình đã xóa cụm bị trùng ở dưới */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onShowHistory) onShowHistory(device);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-2 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
              >
                <History size={16} />
                Lịch sử
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onManageGeofence) onManageGeofence(device);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-2 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
              >
                <Circle size={16} />
                Safe Zone
              </button>

              <button
                onClick={(e) => handleEdit(e, device)}
                className="flex-1 flex items-center justify-center gap-2 px-2 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <Edit2 size={16} />
                Sửa
              </button>

              <button
                onClick={(e) => handleRemove(e, device)}
                disabled={deletingId === device.id}
                className="flex-1 flex items-center justify-center gap-2 px-2 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <Trash2 size={16} />
                {deletingId === device.id ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DeviceList;
