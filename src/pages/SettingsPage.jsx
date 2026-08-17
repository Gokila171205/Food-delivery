import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const SettingsPage = () => {
  const { preferences, setPreferences, logout } = useAppContext();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const togglePreference = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-24 md:py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Settings</h1>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Account</h2>
            <div className="space-y-2">
              <button onClick={() => navigate('/profile')} className="w-full text-left py-2 font-medium text-gray-600 hover:text-primary transition-colors flex justify-between">
                Profile <span className="text-gray-400">&gt;</span>
              </button>
            </div>
          </div>

          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Orders</h2>
            <div className="space-y-2">
              <button onClick={() => navigate('/orders')} className="w-full text-left py-2 font-medium text-gray-600 hover:text-primary transition-colors flex justify-between">
                Order History <span className="text-gray-400">&gt;</span>
              </button>
            </div>
          </div>

          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Delivery</h2>
            <div className="space-y-2">
              <button onClick={() => navigate('/addresses')} className="w-full text-left py-2 font-medium text-gray-600 hover:text-primary transition-colors flex justify-between">
                Saved Addresses <span className="text-gray-400">&gt;</span>
              </button>
            </div>
          </div>

          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Preferences</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Receive promotional notifications</span>
                <input 
                  type="checkbox" 
                  checked={preferences.promo} 
                  onChange={() => togglePreference('promo')} 
                  className="w-5 h-5 accent-primary" 
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Receive order updates via SMS</span>
                <input 
                  type="checkbox" 
                  checked={preferences.orderUpdates} 
                  onChange={() => togglePreference('orderUpdates')} 
                  className="w-5 h-5 accent-primary" 
                />
              </label>
            </div>
          </div>

          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Privacy</h2>
            <div className="space-y-2">
              <button className="w-full text-left py-2 font-medium text-gray-600 hover:text-primary transition-colors flex justify-between">
                Privacy Policy <span className="text-gray-400">&gt;</span>
              </button>
              <button className="w-full text-left py-2 font-medium text-gray-600 hover:text-primary transition-colors flex justify-between">
                Terms & Conditions <span className="text-gray-400">&gt;</span>
              </button>
            </div>
          </div>

          <div className="p-6 bg-red-50">
            <h2 className="text-lg font-bold text-red-600 mb-4 uppercase tracking-wider text-xs">Danger Zone</h2>
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full bg-white border-2 border-red-100 text-red-500 font-bold py-3.5 rounded-xl hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-[slideUp_0.2s_ease-out]">
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Logout?</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to logout from your account?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 shadow-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
