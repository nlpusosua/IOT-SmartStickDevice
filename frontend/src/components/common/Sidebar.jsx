import React from 'react';
import { Plus } from 'lucide-react';
import DeviceFilter from '../device/DeviceFilter';
import DeviceList from '../device/DeviceList';

const Sidebar = ({ 
  isOpen, 
  devices, 
  selectedDevice, 
  onDeviceClick, 
  searchQuery, 
  setSearchQuery, 
  filterStatus, 
  setFilterStatus,
  showGeofence,
  setShowGeofence,
  onAddDevice,
  onEditDevice,
  onDeleteSuccess,
  loading
}) => {
  return (
    <aside
      className={`w-96 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full absolute h-full z-40"
      }`}
    >
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-200">
        <h2 className="text-lg font-semibold">
          Thiết bị ({devices.length})
        </h2>
        <button 
          onClick={onAddDevice}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      <DeviceFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm">Đang tải...</p>
          </div>
        </div>
      ) : (
        <DeviceList 
          devices={devices}
          selectedDevice={selectedDevice}
          onDeviceClick={onDeviceClick}
          onEdit={onEditDevice}
          onDeleteSuccess={onDeleteSuccess}
        />
      )}

      <div className="px-5 py-4 border-t border-gray-200">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showGeofence}
            onChange={(e) => setShowGeofence(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Hiển thị vùng an toàn</span>
        </label>
      </div>
    </aside>
  );
};

export default Sidebar;