import React, { useEffect, useState } from 'react';
import { getAllUsers, banUser, unbanUser } from '../../service/adminService';
import { Search, Ban, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Lỗi tải danh sách users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const isBanning = user.status === 'ACTIVE';
    const actionText = isBanning ? 'Khóa (Ban)' : 'Mở khóa (Unban)';
    
    const result = await Swal.fire({
        title: `Xác nhận ${actionText}?`,
        text: `Bạn có chắc muốn ${actionText} người dùng "${user.fullName}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Hủy',
        confirmButtonColor: isBanning ? '#d33' : '#10b981'
    });

    if (!result.isConfirmed) return;

    try {
        if (isBanning) {
            await banUser(user.id);
            toast.success(`Đã khóa tài khoản ${user.email}`);
        } else {
            await unbanUser(user.id);
            toast.success(`Đã mở khóa tài khoản ${user.email}`);
        }
        fetchUsers(); // Refresh list
    } catch (error) {
        toast.error('Có lỗi xảy ra!');
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h2>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
                type="text" 
                placeholder="Tìm kiếm user..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64"
            />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                    <th className="px-6 py-4 font-semibold text-gray-700">ID</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Họ và tên</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Role</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Thiết bị</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Trạng thái</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Hành động</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {loading ? (
                    <tr><td colSpan="7" className="text-center py-8"><Loader2 className="animate-spin inline" /></td></tr>
                ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-8 text-gray-500">Không tìm thấy user nào</td></tr>
                ) : (
                    filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-600">#{user.id}</td>
                            <td className="px-6 py-4 font-medium text-gray-800">{user.fullName}</td>
                            <td className="px-6 py-4 text-gray-600">{user.email}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{user.deviceCount}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold flex w-fit items-center gap-1 ${
                                    user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                                    user.status === 'BANNED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {user.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                {user.role !== 'ADMIN' && (
                                    <button 
                                        onClick={() => handleToggleStatus(user)}
                                        className={`p-2 rounded hover:bg-opacity-80 transition ${
                                            user.status === 'ACTIVE' 
                                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                                        }`}
                                        title={user.status === 'ACTIVE' ? 'Ban User' : 'Unban User'}
                                    >
                                        {user.status === 'ACTIVE' ? <Ban size={18} /> : <CheckCircle size={18} />}
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;