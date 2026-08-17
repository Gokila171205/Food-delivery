import React, { useEffect, useState } from 'react';
import { getUsers, updateUser, deleteUser } from '../services/adminService';
import { FiRefreshCw, FiTrash2 } from 'react-icons/fi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUser(userId, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(userId);
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900">User Management</h2>
        <button onClick={fetchUsers} className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold transition-colors">
          <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 font-bold text-gray-600 text-sm">Name</th>
                <th className="py-4 px-6 font-bold text-gray-600 text-sm">Email</th>
                <th className="py-4 px-6 font-bold text-gray-600 text-sm">Phone</th>
                <th className="py-4 px-6 font-bold text-gray-600 text-sm">Role</th>
                <th className="py-4 px-6 font-bold text-gray-600 text-sm">Joined</th>
                <th className="py-4 px-6 font-bold text-gray-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="py-4 px-6 text-sm font-bold text-gray-900">{u.name}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{u.email || '-'}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{u.phone}</td>
                  <td className="py-4 px-6">
                    <select 
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="bg-gray-100 border border-gray-200 text-gray-700 py-1.5 px-3 rounded-lg font-bold text-xs focus:outline-none focus:bg-white focus:border-primary"
                    >
                      <option value="customer">Customer</option>
                      <option value="restaurant_owner">Owner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => handleDelete(u._id)} className="text-red-500 hover:text-red-700">
                      <FiTrash2 className="text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500 font-bold">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
