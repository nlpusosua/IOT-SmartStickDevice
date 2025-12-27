import React, { useEffect, useState } from 'react';
import { getAllUsers, banUser, unbanUser, deleteUserAdmin } from '../../service/adminService';
import { Search, Ban, CheckCircle, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Tải danh sách users khi component được mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
      toast.error('Lỗi tải danh sách users');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Khóa / Mở khóa tài khoản
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
      fetchUsers(); // Tải lại danh sách sau khi thao tác
    } catch (error) {
      toast.error('Có lỗi xảy ra khi thay đổi trạng thái!');
    }
  };

  // --- LOGIC XÓA USER (MỚI) ---
  const handleDeleteUser = async (user) => {
    const result = await Swal.fire({
      title: 'Xóa vĩnh viễn user?',
      html: `
        Hành động này <b>không thể hoàn tác</b>!<br/>
        User <b>"${user.fullName}"</b> sẽ bị xóa khỏi hệ thống.<br/>
        Các thiết bị của họ sẽ trở về trạng thái chưa kích hoạt (Unclaimed).
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    });

    if (!result.isConfirmed) return;

    try {
      await deleteUserAdmin(user.id);
      toast.success(`Đã xóa user ${user.email} thành công!`);
      fetchUsers(); // Tải lại danh sách để cập nhật bảng
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi xóa user. Có thể do ràng buộc dữ liệu.');
    }
  };

  // Lọc user theo tên hoặc email khi tìm kiếm
  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header: Tiêu đề và ô tìm kiếm */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm user..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm"
          />
        </div>
      </div>

      {/* Bảng danh sách User */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Họ và tên</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-sm uppercase tracking-wider text-center">Thiết bị</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10">
                    <div className="flex justify-center items-center gap-2 text-blue-600">
                      <Loader2 className="animate-spin" size={24} />
                      <span className="font-medium">Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500 italic">
                    Không tìm thấy user nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 text-gray-600 font-mono text-sm">#{user.id}</td>
                    
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{user.fullName}</div>
                    </td>
                    
                    <td className="px-6 py-4 text-gray-600 text-sm">{user.email}</td>
                    
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                        user.role === 'ADMIN' 
                          ? 'bg-purple-100 text-purple-700 border-purple-200' 
                          : 'bg-blue-100 text-blue-700 border-blue-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-bold text-xs">
                        {user.deviceCount}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex w-fit items-center gap-1.5 ${
                        user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                        user.status === 'BANNED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                           user.status === 'ACTIVE' ? 'bg-green-500' : 
                           user.status === 'BANNED' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></span>
                        {user.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      {/* Chỉ hiển thị nút thao tác nếu user KHÔNG phải là ADMIN */}
                      {user.role !== 'ADMIN' && (
                        <div className="flex gap-3">
                          {/* Nút Khóa / Mở Khóa */}
                          <button 
                            onClick={() => handleToggleStatus(user)}
                            className={`p-2 rounded-lg transition-all duration-200 shadow-sm border ${
                              user.status === 'ACTIVE' 
                                ? 'bg-white text-yellow-600 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300' 
                                : 'bg-white text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300'
                            }`}
                            title={user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          >
                            {user.status === 'ACTIVE' ? <Ban size={18} /> : <CheckCircle size={18} />}
                          </button>

                          {/* Nút Xóa (MỚI) */}
                          <button 
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 rounded-lg bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200 shadow-sm"
                            title="Xóa vĩnh viễn user"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;