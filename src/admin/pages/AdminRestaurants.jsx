import React, { useEffect, useState } from 'react';
import { getRestaurants, deleteRestaurant } from '../services/adminService';
import { FiRefreshCw, FiTrash2 } from 'react-icons/fi';

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const res = await getRestaurants();
      setRestaurants(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this restaurant? This cannot be undone.')) return;
    try {
      await deleteRestaurant(id);
      setRestaurants(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete restaurant');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900">Restaurant Management</h2>
        <button onClick={fetchRestaurants} className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold transition-colors">
          <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 font-bold text-gray-600 text-sm">Restaurant</th>
                <th className="py-4 px-6 font-bold text-gray-600 text-sm">Owner</th>
                <th className="py-4 px-6 font-bold text-gray-600 text-sm">City</th>
                <th className="py-4 px-6 font-bold text-gray-600 text-sm">Status</th>
                <th className="py-4 px-6 font-bold text-gray-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map(r => (
                <tr key={r._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <p className="font-bold text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-500">{r.category}</p>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{r.owner?.name || 'Unknown'}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{r.city}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${r.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {r.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => handleDelete(r._id)} className="text-red-500 hover:text-red-700">
                      <FiTrash2 className="text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
              {restaurants.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500 font-bold">No restaurants found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRestaurants;
