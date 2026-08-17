import React, { useEffect, useState } from 'react';
import { getOwnerFoods, deleteOwnerFood, createOwnerFood } from '../services/ownerService';
import { FiRefreshCw, FiTrash2, FiPlus } from 'react-icons/fi';

const OwnerFoods = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const res = await getOwnerFoods();
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
      await deleteOwnerFood(id);
      setFoods(prev => prev.filter(f => f._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete food');
    }
  };

  const handleCreateMockFood = async () => {
    try {
      const res = await createOwnerFood({
        name: "New Custom Dish",
        description: "A delicious new addition",
        price: 299,
        category: "Mains",
        foodType: "veg",
        isVeg: true,
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500"
      });
      setFoods(prev => [res.data.data, ...prev]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create food');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900">Menu & Foods</h2>
        <div className="flex gap-3">
          <button onClick={fetchFoods} className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold transition-colors">
            <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={handleCreateMockFood} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition-colors shadow-md">
            <FiPlus /> Add Food
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-4 px-6 font-bold text-slate-600 text-sm">Food</th>
                <th className="py-4 px-6 font-bold text-slate-600 text-sm">Price</th>
                <th className="py-4 px-6 font-bold text-slate-600 text-sm">Type</th>
                <th className="py-4 px-6 font-bold text-slate-600 text-sm">Status</th>
                <th className="py-4 px-6 font-bold text-slate-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {foods.map(f => (
                <tr key={f._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-900">{f.name}</p>
                    <p className="text-xs text-slate-500">{f.category}</p>
                  </td>
                  <td className="py-4 px-6 text-sm font-extrabold text-slate-900">₹{f.price}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${f.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {f.isVeg ? 'Veg' : 'Non-Veg'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${f.isAvailable ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                      {f.isAvailable ? 'Available' : 'Unavailable'}
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
                  <td colSpan="5" className="py-8 text-center text-slate-500 font-bold">No foods found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OwnerFoods;
