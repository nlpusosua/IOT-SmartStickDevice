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
  setShowGeofence
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
        <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={20} />
        </button>
      </div>

      <DeviceFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      <DeviceList 
        devices={devices}
        selectedDevice={selectedDevice}
        onDeviceClick={onDeviceClick}
      />

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