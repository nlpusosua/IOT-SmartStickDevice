import React, { useEffect, useState } from 'react';
import { getAllDevicesAdmin, createDeviceAdmin, deleteDeviceAdmin } from '../../service/adminService';
import { Search, Plus, Trash2, Smartphone, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const AdminDevices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newToken, setNewToken] = useState('');
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchDevices = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const data = await getAllDevicesAdmin();
      setDevices(data);
    } catch (error) {
      if (!isBackground) toast.error('Lỗi tải danh sách thiết bị');
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices(false);

    // Polling: Tự động tải lại danh sách mỗi 5 giây
    const intervalId = setInterval(() => {
        fetchDevices(true);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const generateToken = () => {
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + 
                       Math.random().toString(36).substring(2, 6).toUpperCase();
    setNewToken(`IOT-${randomPart}`);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newToken) return toast.warning('Vui lòng nhập Token');
    setCreating(true);
    try {
        await createDeviceAdmin({ deviceToken: newToken, name: newName });
        toast.success('Tạo thiết bị thành công');
        setShowModal(false);
        setNewToken('');
        setNewName('');
        fetchDevices(false);
    } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi tạo thiết bị');
    } finally {
        setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
        title: 'Xóa vĩnh viễn?',
        text: "Hành động này không thể hoàn tác!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) return;

    try {
        await deleteDeviceAdmin(id);
        toast.success('Đã xóa thiết bị');
        fetchDevices(false);
    } catch (error) {
        toast.error('Lỗi khi xóa thiết bị');
    }
  };

  const filteredDevices = devices.filter(d => 
    d.deviceToken.toLowerCase().includes(search.toLowerCase()) || 
    (d.name && d.name.toLowerCase().includes(search.toLowerCase())) ||
    (d.ownerName && d.ownerName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Kho Thiết bị</h2>
        <button 
            onClick={() => { setShowModal(true); generateToken(); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
            <Plus size={18} /> Nhập kho thiết bị mới
        </button>
      </div>

      <div className="mb-4">
        <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
                type="text" 
                placeholder="Tìm token, tên, chủ sở hữu..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
            />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                    <th className="px-6 py-4 font-semibold text-gray-700">ID</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Device Token</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Tên hiển thị</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Chủ sở hữu</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Trạng thái</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Hành động</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {loading ? (
                    <tr><td colSpan="6" className="text-center py-8"><Loader2 className="animate-spin inline" /></td></tr>
                ) : filteredDevices.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-8 text-gray-500">Kho trống</td></tr>
                ) : (
                    filteredDevices.map(device => (
                        <tr key={device.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-600">#{device.id}</td>
                            <td className="px-6 py-4 font-mono font-medium text-blue-600">{device.deviceToken}</td>
                            <td className="px-6 py-4 text-gray-800">{device.name}</td>
                            <td className="px-6 py-4">
                                {device.ownerName !== "Chưa kích hoạt" ? (
                                    <span className="text-gray-800 font-medium">{device.ownerName}</span>
                                ) : (
                                    <span className="text-gray-400 italic">Trong kho</span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    device.status === 'ONLINE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {device.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <button 
                                    onClick={() => handleDelete(device.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded transition"
                                    title="Xóa vĩnh viễn"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>

      {/* Modal Create */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
                <h3 className="text-lg font-bold mb-4">Nhập kho thiết bị mới</h3>
                <form onSubmit={handleCreate}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Device Token</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={newToken}
                                onChange={(e) => setNewToken(e.target.value)}
                                className="flex-1 border rounded px-3 py-2 font-mono"
                                placeholder="IOT-XXX..."
                                required
                            />
                            <button type="button" onClick={generateToken} className="p-2 bg-gray-100 rounded hover:bg-gray-200" title="Random">
                                <RefreshCw size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-1">Tên mặc định (Optional)</label>
                        <input 
                            type="text" 
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            placeholder="New Device"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setShowModal(false)}
                            className="flex-1 py-2 border rounded hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            disabled={creating}
                            className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {creating ? 'Đang tạo...' : 'Xác nhận'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDevices;