import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/adminService';
import { FiUsers, FiShoppingBag, FiCoffee, FiList, FiDollarSign } from 'react-icons/fi';

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-center py-20 font-bold text-gray-500">Loading Dashboard...</div>;
  if (!stats) return <div className="text-center py-20 font-bold text-red-500">Failed to load statistics</div>;

  return (
    <div>
      <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard title="Revenue" value={`₹${stats.totalRevenue}`} icon={<FiDollarSign />} color="bg-green-100 text-green-600" />
        <StatCard title="Users" value={stats.totalUsers} icon={<FiUsers />} color="bg-blue-100 text-blue-600" />
        <StatCard title="Restaurants" value={stats.totalRestaurants} icon={<FiShoppingBag />} color="bg-orange-100 text-orange-600" />
        <StatCard title="Foods" value={stats.totalFoods} icon={<FiCoffee />} color="bg-purple-100 text-purple-600" />
        <StatCard title="Orders" value={stats.totalOrders} icon={<FiList />} color="bg-pink-100 text-pink-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 font-bold text-gray-600 text-sm">Order ID</th>
                  <th className="py-3 font-bold text-gray-600 text-sm">Customer</th>
                  <th className="py-3 font-bold text-gray-600 text-sm">Amount</th>
                  <th className="py-3 font-bold text-gray-600 text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(order => (
                  <tr key={order._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="py-4 text-sm font-medium text-gray-900">#{order.orderId || order._id.toString().slice(-6).toUpperCase()}</td>
                    <td className="py-4 text-sm text-gray-600">{order.user?.name || 'Unknown'}</td>
                    <td className="py-4 text-sm font-bold text-gray-900">₹{order.bill?.total || order.total || 0}</td>
                    <td className="py-4">
                      <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {stats.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-500">No recent orders</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Order Status</h3>
          <div className="space-y-4">
            {Object.entries(stats.orderStatusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-600 capitalize">{status.replace('_', ' ')}</span>
                <span className="text-sm font-extrabold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
