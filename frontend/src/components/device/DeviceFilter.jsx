import React from 'react';
import { Search } from 'lucide-react';

const DeviceFilter = ({ searchQuery, setSearchQuery, filterStatus, setFilterStatus }) => {
  return (
    <div className="px-5 py-5 border-b border-gray-200 space-y-3">
      <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-lg">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm thiết bị..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-sm"
        />
      </div>

      <div className="flex gap-2">
        {['all', 'online', 'offline'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors capitalize ${
              filterStatus === status
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {status === 'all' ? 'Tất cả' : status}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DeviceFilter;