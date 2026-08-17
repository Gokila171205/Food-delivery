import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiHelpCircle, FiUser, FiShoppingCart, FiChevronDown, FiMapPin } from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { searchFoods } from '../services/foodService';
import { searchRestaurants } from '../services/restaurantService';

const Navbar = () => {
  const { cartCount, location, setIsLocationModalOpen, setIsCartDrawerOpen, user } = useAppContext();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState({ food: [], restaurants: [] });
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let timeoutId;

    if (searchQuery.trim().length > 0) {
      const fetchSearchResults = async () => {
        try {
          const [foodRes, restaurantRes] = await Promise.all([
            searchFoods(searchQuery),
            searchRestaurants(searchQuery)
          ]);
          setSearchResults({ 
            food: foodRes.foods, 
            restaurants: restaurantRes.restaurants 
          });
          setShowDropdown(true);
        } catch (error) {
          console.error("Error fetching search results:", error);
        }
      };

      // Debounce API calls by 300ms
      timeoutId = setTimeout(() => {
        fetchSearchResults();
      }, 300);
    } else {
      setShowDropdown(false);
      setSearchResults({ food: [], restaurants: [] });
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleItemClick = (type, item) => {
    setShowDropdown(false);
    if (type === 'food') {
      navigate(`/search?q=${encodeURIComponent(item.name)}`);
    } else {
      navigate(`/restaurant/${item.id}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Location - Left Side */}
          <div className="flex items-center gap-4 lg:gap-8">
            <a href="/" className="flex items-center gap-2">
              <div className="bg-primary text-white p-2 rounded-xl font-bold text-xl">FR</div>
              <span className="font-extrabold text-2xl tracking-tight text-gray-900 hidden md:block">FoodRush</span>
            </a>
            
            <div 
              className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors group"
              onClick={() => setIsLocationModalOpen(true)}
            >
              <div className="hidden md:flex flex-col">
                <div className="flex items-center gap-1 text-sm font-bold text-gray-800 group-hover:text-primary">
                  <FiMapPin className="text-primary" /> {location.split(',')[0]} <FiChevronDown />
                </div>
                <span className="text-xs text-lightText truncate w-24 lg:w-48">{location}</span>
              </div>
              <div className="md:hidden flex items-center gap-1 text-sm font-bold text-gray-800">
                <FiMapPin className="text-primary" /> {location.split(',')[0]} <FiChevronDown />
              </div>
            </div>
          </div>

          {/* Search Bar - Middle (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative" ref={dropdownRef}>
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                placeholder="Search for food or restaurants" 
                className="w-full bg-gray-100 rounded-lg py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:bg-white focus:shadow-md"
              />
              <FiSearch className="absolute left-3.5 top-3 text-gray-500 text-lg" />
            </form>

            {/* Dropdown Results */}
            {showDropdown && (searchResults.food.length > 0 || searchResults.restaurants.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 max-h-[400px] overflow-y-auto z-50">
                
                {searchResults.food.length > 0 && (
                  <div className="p-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Food</h3>
                    {searchResults.food.map(item => (
                      <div 
                        key={`food-${item.id}`} 
                        className="flex items-center gap-3 p-2 hover:bg-orange-50 cursor-pointer rounded-md transition-colors"
                        onClick={() => handleItemClick('food', item)}
                      >
                        <span className="text-xl">{item.isVeg ? '🥗' : '🍗'}</span>
                        <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {searchResults.restaurants.length > 0 && (
                  <div className="p-3 border-t border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Restaurants</h3>
                    {searchResults.restaurants.map(item => (
                      <div 
                        key={`res-${item.id}`} 
                        className="flex items-center gap-3 p-2 hover:bg-orange-50 cursor-pointer rounded-md transition-colors"
                        onClick={() => handleItemClick('restaurant', item)}
                      >
                        <span className="text-xl">🍴</span>
                        <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Links - Right Side */}
          <div className="flex items-center gap-6">
            <button className="hidden lg:flex flex-col items-center gap-1 text-gray-600 hover:text-primary transition-colors">
              <span className="text-sm font-medium">Offers</span>
            </button>
            <button className="hidden lg:flex flex-col items-center gap-1 text-gray-600 hover:text-primary transition-colors">
              <span className="text-sm font-medium">Help</span>
            </button>
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-800 font-bold px-4 py-2 rounded-full hover:bg-gray-100 transition-colors">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden md:block">{user.name.split(' ')[0]}</span>
                  <span className="text-[10px]">▼</span>
                </button>
                
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="p-4 border-b border-gray-50">
                    <p className="font-bold text-gray-900 line-clamp-1">{user.name}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{user.email}</p>
                  </div>
                  <div className="py-2">
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-primary transition-colors">
                      👤 My Profile
                    </Link>
                    <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-primary transition-colors">
                      📦 My Orders
                    </Link>
                    <Link to="/favourites" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-red-50 hover:text-red-500 transition-colors">
                      ❤️ Favourites
                    </Link>
                    <Link to="/addresses" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-primary transition-colors">
                      📍 Addresses
                    </Link>
                    <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-primary transition-colors">
                      ⚙️ Settings
                    </Link>
                  </div>
                  <div className="border-t border-gray-50 py-2">
                    <button 
                      onClick={() => navigate('/settings')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 bg-gray-900 text-white font-bold px-6 py-2.5 rounded-full hover:bg-gray-800 transition-colors shadow-md"
              >
                <FiUser className="text-xl" /> Login
              </button>
            )}
            
            {/* Cart */}
            <div 
              className="relative cursor-pointer hover:text-primary transition-colors flex items-center gap-2 group"
              onClick={() => setIsCartDrawerOpen(true)}
            >
              <div className="relative">
                <FiShoppingCart className="text-2xl group-hover:text-primary text-gray-800" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden md:block font-bold text-gray-800 group-hover:text-primary">Cart</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
