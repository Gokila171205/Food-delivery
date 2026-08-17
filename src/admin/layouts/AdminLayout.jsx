import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { FiHome, FiUsers, FiShoppingBag, FiCoffee, FiList, FiTag, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <FiHome />, exact: true },
    { name: 'Users', path: '/admin/users', icon: <FiUsers /> },
    { name: 'Restaurants', path: '/admin/restaurants', icon: <FiShoppingBag /> },
    { name: 'Foods', path: '/admin/foods', icon: <FiCoffee /> },
    { name: 'Orders', path: '/admin/orders', icon: <FiList /> },
    { name: 'Coupons', path: '/admin/coupons', icon: <FiTag /> },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="p-6">
        <h1 className="text-2xl font-extrabold text-primary">FoodRush</h1>
        <p className="text-gray-400 text-sm mt-1">Admin Portal</p>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.exact}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-primary text-white font-bold' : 'text-gray-300 hover:bg-gray-800 hover:text-white font-medium'}`
              }
            >
              <span className="text-xl">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{user?.name}</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors font-medium"
        >
          <FiLogOut className="text-xl" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar (Mobile only) */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:hidden shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
              <FiMenu className="text-2xl" />
            </button>
            <span className="font-extrabold text-lg text-gray-900">Admin</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
