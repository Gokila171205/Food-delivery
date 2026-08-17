import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { FiUser, FiPackage, FiHeart, FiMapPin, FiSettings, FiEdit2, FiX } from 'react-icons/fi';

const ProfilePage = () => {
  const { user, updateProfile, logout } = useAppContext();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({ name: user.name, email: user.email, phone: user.phone });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!editData.name.trim() || !editData.email.trim() || !editData.phone.trim()) {
      setError("Please fill all fields");
      return;
    }
    
    setError('');
    setIsLoading(true);
    try {
      await updateProfile(editData);
      setIsEditModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-24 md:py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Profile</h1>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center gap-6 relative">
          <div className="w-24 h-24 bg-orange-100 text-primary rounded-full flex items-center justify-center text-4xl font-extrabold shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-extrabold text-gray-900">{user.name}</h2>
            <p className="text-gray-500 font-medium mb-1">{user.phone}</p>
            <p className="text-gray-500 font-medium">{user.email}</p>
          </div>
          <button 
            onClick={() => {
              setEditData({ name: user.name, email: user.email, phone: user.phone });
              setError('');
              setIsEditModalOpen(true);
            }}
            className="md:absolute md:top-8 md:right-8 flex items-center gap-2 text-primary font-bold bg-orange-50 px-4 py-2 rounded-xl hover:bg-orange-100 transition-colors"
          >
            <FiEdit2 /> Edit Profile
          </button>
        </div>

        <h3 className="text-xl font-extrabold text-gray-900 mb-4">Account</h3>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <button onClick={() => navigate('/orders')} className="w-full flex items-center justify-between p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-600 group-hover:text-primary group-hover:bg-orange-50 transition-colors">
                <FiPackage className="text-xl" />
              </div>
              <span className="font-bold text-gray-800 text-lg">My Orders</span>
            </div>
            <span className="text-gray-300 group-hover:text-primary transition-colors text-xl font-bold">&gt;</span>
          </button>
          
          <button onClick={() => navigate('/favourites')} className="w-full flex items-center justify-between p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-600 group-hover:text-red-500 group-hover:bg-red-50 transition-colors">
                <FiHeart className="text-xl" />
              </div>
              <span className="font-bold text-gray-800 text-lg">Favourites</span>
            </div>
            <span className="text-gray-300 group-hover:text-red-500 transition-colors text-xl font-bold">&gt;</span>
          </button>
          
          <button onClick={() => navigate('/addresses')} className="w-full flex items-center justify-between p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-600 group-hover:text-primary group-hover:bg-orange-50 transition-colors">
                <FiMapPin className="text-xl" />
              </div>
              <span className="font-bold text-gray-800 text-lg">Saved Addresses</span>
            </div>
            <span className="text-gray-300 group-hover:text-primary transition-colors text-xl font-bold">&gt;</span>
          </button>
          
          <button onClick={() => navigate('/settings')} className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors text-left group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-600 group-hover:text-primary group-hover:bg-orange-50 transition-colors">
                <FiSettings className="text-xl" />
              </div>
              <span className="font-bold text-gray-800 text-lg">Settings</span>
            </div>
            <span className="text-gray-300 group-hover:text-primary transition-colors text-xl font-bold">&gt;</span>
          </button>
        </div>

        <button onClick={handleLogout} className="w-full flex items-center justify-center p-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-colors shadow-sm">
          Log Out
        </button>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 animate-[slideUp_0.3s_ease-out]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold text-gray-900">Edit Profile</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <FiX />
              </button>
            </div>
            
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl text-center">{error}</div>}

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editData.name} 
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  value={editData.email} 
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Number</label>
                <input 
                  type="text" 
                  value={editData.phone} 
                  onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <button 
              onClick={handleSave} 
              disabled={isLoading}
              className={`w-full py-4 bg-primary text-white font-bold rounded-xl shadow-md transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-orange-600'}`}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
