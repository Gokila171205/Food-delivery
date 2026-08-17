import React, { useEffect, useState } from 'react';
import { getOwnerOrders, updateOwnerOrderStatus } from '../services/ownerService';
import { FiRefreshCw, FiChevronDown } from 'react-icons/fi';

const OwnerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getOwnerOrders();
      setOrders(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOwnerOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900">Orders</h2>
        <div className="flex gap-4">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold outline-none"
          >
            <option value="">All Order Status</option>
            <option value="placed">Placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select 
            value={paymentFilter} 
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold outline-none"
          >
            <option value="">All Payment Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <button onClick={fetchOrders} className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold transition-colors">
            <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-4 px-6 font-bold text-slate-600 text-sm">Order ID</th>
                <th className="py-4 px-6 font-bold text-slate-600 text-sm">Customer</th>
                <th className="py-4 px-6 font-bold text-slate-600 text-sm">Amount</th>
                <th className="py-4 px-6 font-bold text-slate-600 text-sm">Payment</th>
                <th className="py-4 px-6 font-bold text-slate-600 text-sm">Date</th>
                <th className="py-4 px-6 font-bold text-slate-600 text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders
                .filter(o => statusFilter ? o.status === statusFilter : true)
                .filter(o => paymentFilter ? o.paymentStatus === paymentFilter : true)
                .map(order => (
                <tr key={order._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="py-4 px-6 text-sm font-medium text-slate-900">#{order.orderId || order._id.toString().slice(-6).toUpperCase()}</td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    <p className="font-bold text-slate-900">{order.user?.name || 'Unknown'}</p>
                    <p className="text-xs">{order.user?.email}</p>
                  </td>
                  <td className="py-4 px-6 text-sm font-extrabold text-slate-900">₹{order.bill?.total || order.total || 0}</td>
                  <td className="py-4 px-6 text-sm">
                    <div className="font-bold text-slate-800">{order.paymentMethod}</div>
                    <div className={`text-xs font-bold uppercase ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                      {order.paymentStatus}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 px-6">
                    <div className="relative inline-block w-full min-w-[140px]">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updatingId === order._id || order.status === 'cancelled'}
                        className={`appearance-none w-full bg-slate-100 border border-slate-200 text-slate-700 py-2 px-4 pr-8 rounded-lg font-bold text-sm leading-tight focus:outline-none focus:bg-white focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <option value="placed">Placed</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                        <FiChevronDown />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 font-bold">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OwnerOrders;
