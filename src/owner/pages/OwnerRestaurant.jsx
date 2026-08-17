import React, { useEffect, useState } from 'react';
import { getOwnerRestaurant, updateOwnerRestaurant } from '../services/ownerService';
import { FiSave } from 'react-icons/fi';

const OwnerRestaurant = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await getOwnerRestaurant();
        setRestaurant(res.data.data);
        setFormData({
          name: res.data.data.name,
          description: res.data.data.description,
          city: res.data.data.city,
          address: res.data.data.address,
          openingTime: res.data.data.openingTime,
          closingTime: res.data.data.closingTime,
          category: res.data.data.category,
          isOpen: res.data.data.isOpen,
          image: res.data.data.image || ''
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateOwnerRestaurant(formData);
      setRestaurant(res.data.data);
      alert('Restaurant updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update restaurant');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center font-bold text-slate-500">Loading Restaurant Profile...</div>;
  
  if (!restaurant) return (
    <div className="py-20 text-center font-bold text-red-500">
      Restaurant not found. Please contact an administrator to link a restaurant to your account.
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-extrabold text-slate-900 mb-6">My Restaurant</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Restaurant Name</label>
              <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-medium" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
              <input type="text" name="category" value={formData.category || ''} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-medium" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea name="description" value={formData.description || ''} onChange={handleChange} rows="3" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-medium"></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
              <input type="text" name="city" value={formData.city || ''} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-medium" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Address</label>
              <input type="text" name="address" value={formData.address || ''} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-medium" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Opening Time</label>
              <input type="time" name="openingTime" value={formData.openingTime || ''} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-medium" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Closing Time</label>
              <input type="time" name="closingTime" value={formData.closingTime || ''} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-medium" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Image URL</label>
              <input type="text" name="image" value={formData.image || ''} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-medium" />
            </div>
            <div className="md:col-span-2 flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <input type="checkbox" id="isOpen" name="isOpen" checked={formData.isOpen || false} onChange={handleChange} className="w-5 h-5 accent-blue-600" />
              <label htmlFor="isOpen" className="font-bold text-slate-700 cursor-pointer">Currently Open for Orders</label>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button type="submit" disabled={saving} className={`flex items-center gap-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors ${saving ? 'opacity-70' : ''}`}>
              <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OwnerRestaurant;
