import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { FiHome, FiShoppingBag, FiCoffee, FiList, FiLogOut, FiMenu } from 'react-icons/fi';

const OwnerLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/owner', icon: <FiHome />, exact: true },
    { name: 'My Restaurant', path: '/owner/restaurant', icon: <FiShoppingBag /> },
    { name: 'Menu & Foods', path: '/owner/foods', icon: <FiCoffee /> },
    { name: 'Orders', path: '/owner/orders', icon: <FiList /> },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-6">
        <h1 className="text-2xl font-extrabold text-blue-500">FoodRush</h1>
        <p className="text-slate-400 text-sm mt-1">Restaurant Partner</p>
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
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white font-medium'}`
              }
            >
              <span className="text-xl">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{user?.name}</p>
            <p className="text-xs text-slate-400">Restaurant Owner</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors font-medium"
        >
          <FiLogOut className="text-xl" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar (Mobile only) */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:hidden shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100">
              <FiMenu className="text-2xl" />
            </button>
            <span className="font-extrabold text-lg text-slate-900">Partner Hub</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default OwnerLayout;
