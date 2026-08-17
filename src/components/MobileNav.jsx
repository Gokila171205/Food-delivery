import React from 'react';
import { FiHome, FiSearch, FiShoppingCart, FiUser } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileNav = () => {
  const { cartCount, setIsCartDrawerOpen, user } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <button 
        onClick={() => navigate('/')}
        className={`flex flex-col items-center gap-1 w-16 ${location.pathname === '/' ? 'text-primary' : 'text-gray-500 hover:text-primary transition-colors'}`}
      >
        <FiHome className="text-xl" />
        <span className="text-[10px] font-bold">Home</span>
      </button>
      
      <button 
        onClick={() => navigate('/search')}
        className={`flex flex-col items-center gap-1 w-16 ${location.pathname.startsWith('/search') ? 'text-primary' : 'text-gray-500 hover:text-primary transition-colors'}`}
      >
        <FiSearch className="text-xl" />
        <span className="text-[10px] font-medium">Search</span>
      </button>
      
      {user && (
        <button 
          onClick={() => navigate('/orders')}
          className={`flex flex-col items-center gap-1 w-16 ${location.pathname.startsWith('/orders') ? 'text-primary' : 'text-gray-500 hover:text-primary transition-colors'}`}
        >
          <FiHome className="text-xl" /> {/* using home or box icon if available */}
          <span className="text-[10px] font-bold">Orders</span>
        </button>
      )}
      
      <button 
        onClick={() => setIsCartDrawerOpen(true)}
        className="flex flex-col items-center gap-1 text-gray-500 hover:text-primary transition-colors w-16 relative"
      >
        <FiShoppingCart className="text-xl" />
        <span className="text-[10px] font-medium">Cart</span>
        {cartCount > 0 && (
          <span className="absolute 1 top-0 right-3 bg-primary text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
            {cartCount}
          </span>
        )}
      </button>
      
      <button 
        onClick={() => navigate(user ? '/profile' : '/login')}
        className={`flex flex-col items-center gap-1 w-16 ${['/profile', '/login', '/signup'].includes(location.pathname) ? 'text-primary' : 'text-gray-500 hover:text-primary transition-colors'}`}
      >
        {user ? (
          <>
            <div className="w-5 h-5 bg-gray-200 text-gray-800 rounded-full flex items-center justify-center text-[10px] font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-[10px] font-medium">Account</span>
          </>
        ) : (
          <>
            <FiUser className="text-xl" />
            <span className="text-[10px] font-medium">Login</span>
          </>
        )}
      </button>
    </div>
  );
};

export default MobileNav;
