import React, { useEffect, useState } from 'react';
import { getFoods, deleteFood } from '../services/adminService';
import { FiRefreshCw, FiTrash2 } from 'react-icons/fi';

const AdminFoods = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const res = await getFoods();
      setFoods(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this food item?')) return;
    try {
      await deleteFood(id);
      setFoods(prev => prev.filter(f => f._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete food');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900">Food Management</h2>
        <button onClick={fetchFoods} className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold transition-colors">
          <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 font-bold text-gray-600 text-sm">Food</th>
                <th className="py-4 px-6 font-bold text-gray-600 text-sm">Restaurant</th>
                <th className="py-4 px-6 font-bold text-gray-600 text-sm">Price</th>
                <th className="py-4 px-6 font-bold text-gray-600 text-sm">Type</th>
                <th className="py-4 px-6 font-bold text-gray-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {foods.map(f => (
                <tr key={f._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <p className="font-bold text-gray-900">{f.name}</p>
                    <p className="text-xs text-gray-500">{f.category}</p>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{f.restaurant?.name || 'Unknown'}</td>
                  <td className="py-4 px-6 text-sm font-bold text-gray-900">₹{f.price}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${f.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {f.isVeg ? 'Veg' : 'Non-Veg'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => handleDelete(f._id)} className="text-red-500 hover:text-red-700">
                      <FiTrash2 className="text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
              {foods.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500 font-bold">No foods found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFoods;
