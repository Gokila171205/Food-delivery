import React, { useEffect, useState } from 'react';
import { getCoupons, createCoupon, deleteCoupon } from '../services/adminService';
import { FiRefreshCw, FiTrash2, FiPlus } from 'react-icons/fi';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await getCoupons();
      setCoupons(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const handleCreateMockCoupon = async () => {
    try {
      const res = await createCoupon({
        code: `DISCOUNT${Math.floor(Math.random() * 1000)}`,
        discountType: "percentage",
        discountValue: 20,
        minimumOrderValue: 500,
        maximumDiscount: 150,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      setCoupons(prev => [res.data.data, ...prev]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create coupon');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900">Coupon Management</h2>
        <div className="flex gap-3">
          <button onClick={fetchCoupons} className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold transition-colors">
            <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={handleCreateMockCoupon} className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-bold transition-colors shadow-md">
            <FiPlus /> Add Coupon
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 font-bold text-gray-600 text-sm">Code</th>
                <th className="py-4 px-6 font-bold text-gray-600 text-sm">Type</th>
                <th className="py-4 px-6 font-bold text-gray-600 text-sm">Value</th>
                <th className="py-4 px-6 font-bold text-gray-600 text-sm">Min Order</th>
                <th className="py-4 px-6 font-bold text-gray-600 text-sm">Expires</th>
                <th className="py-4 px-6 font-bold text-gray-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="py-4 px-6 text-sm font-extrabold text-primary tracking-wider">{c.code}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 capitalize">{c.discountType}</td>
                  <td className="py-4 px-6 text-sm font-bold text-gray-900">
                    {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">₹{c.minimumOrderValue}</td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {new Date(c.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => handleDelete(c._id)} className="text-red-500 hover:text-red-700">
                      <FiTrash2 className="text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500 font-bold">No coupons found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;
