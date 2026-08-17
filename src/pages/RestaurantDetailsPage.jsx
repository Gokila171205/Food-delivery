import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { offers } from '../data/mockData'; // Keeping offers from mockData as it's not in backend
import { getRestaurantById } from '../services/restaurantService';
import { getFoodsByRestaurant } from '../services/foodService';
import DishCard from '../components/DishCard';
import { FiArrowLeft, FiStar, FiHeart, FiSearch, FiClock, FiDollarSign, FiCopy, FiShoppingBag } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';

const RestaurantDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { favorites, toggleFavorite, showToast, cartCount, cartTotal, setIsCartDrawerOpen } = useAppContext();
  
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [resResponse, menuResponse] = await Promise.all([
          getRestaurantById(id),
          getFoodsByRestaurant(id)
        ]);
        setRestaurant(resResponse.restaurant);
        setMenu(menuResponse.foods);
      } catch (err) {
        console.error('Error fetching restaurant details:', err);
        setError('Unable to load restaurant details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
  }, [id]);

  const isFavorite = restaurant ? favorites.includes(restaurant.id) : false;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 animate-pulse">
        <div className="h-64 md:h-80 w-full bg-gray-300"></div>
        <div className="container mx-auto px-4 lg:px-8 -mt-24 relative z-20 max-w-5xl">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 mb-8 h-48"></div>
          <div className="bg-gray-200 h-12 w-full rounded-full mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="bg-white h-32 rounded-2xl"></div>)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-4">{error || 'Restaurant not found'}</h2>
        <div className="flex gap-4">
          <button onClick={() => window.location.reload()} className="bg-primary text-white font-bold px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">Retry</button>
          <button onClick={() => navigate(-1)} className="text-gray-600 font-bold px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors">Go Back</button>
        </div>
      </div>
    );
  }


  const categories = [...new Set(menu.map(d => d.category))];
  
  // Set initial active category
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  const displayedMenu = searchQuery.trim() 
    ? menu.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : menu;

  const groupedMenu = categories.reduce((acc, cat) => {
    acc[cat] = displayedMenu.filter(d => d.category === cat);
    return acc;
  }, {});

  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    showToast(`Coupon ${code} copied!`);
  };

  const scrollToCategory = (cat) => {
    setActiveCategory(cat);
    const element = document.getElementById(`category-${cat}`);
    if (element) {
      // Offset for sticky header
      const y = element.getBoundingClientRect().top + window.pageYOffset - 140;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header Image Section */}
      <div className="relative h-64 md:h-80 w-full">
        <img 
          src={restaurant.image} 
          alt={restaurant.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30"></div>
        
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-4 md:left-8 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors z-10"
        >
          <FiArrowLeft className="text-xl" />
        </button>

        <button 
          onClick={() => toggleFavorite(restaurant.id)}
          className="absolute top-6 right-4 md:right-8 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors z-10"
        >
          <FiHeart className={`text-xl transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>

      <div className="container mx-auto px-4 lg:px-8 -mt-24 relative z-20 max-w-5xl">
        
        {/* Info Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{restaurant.name}</h1>
              <p className="text-gray-500 font-medium text-sm md:text-base mb-4">{restaurant.cuisines.join(', ')}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-bold text-gray-700">
                <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg">
                  <FiStar /> {restaurant.rating} (2.5K ratings)
                </div>
                <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg">
                  <FiClock /> {restaurant.time}
                </div>
                <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg">
                  <FiDollarSign /> {restaurant.priceForTwo}
                </div>
              </div>
            </div>
          </div>

          <hr className="my-6 border-dashed border-gray-200" />
          
          <div className="flex items-center gap-2 text-gray-600 font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Open now <span className="mx-2">•</span> 📍 {restaurant.distance}
          </div>
        </div>

        {/* Offers Section */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Offers for you</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
            {offers.slice(0, 3).map(offer => (
              <div key={offer.id} className="min-w-[280px] md:min-w-[320px] bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 snap-start shrink-0">
                <div className="text-3xl">🏷️</div>
                <div className="flex-1">
                  <p className="font-extrabold text-gray-800 text-sm mb-1">{offer.title}</p>
                  <p className="text-xs text-gray-500 font-medium">Use code {offer.code}</p>
                </div>
                <button 
                  onClick={() => copyCoupon(offer.code)}
                  className="p-2 text-primary hover:bg-orange-50 rounded-lg transition-colors"
                  title="Copy Code"
                >
                  <FiCopy className="text-xl" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Menu Navigation */}
        <div className="sticky top-20 z-30 bg-gray-50/90 backdrop-blur-md pt-4 pb-4 mb-8 -mx-4 px-4 md:mx-0 md:px-0 border-b border-gray-200">
          <div className="flex gap-3 overflow-x-auto hide-scrollbar">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => scrollToCategory(cat)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-sm transition-colors ${
                  activeCategory === cat 
                    ? 'bg-gray-900 text-white shadow-md' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search within menu */}
        <div className="mb-10 relative max-w-xl mx-auto">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in menu..." 
            className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium text-gray-700 shadow-sm"
          />
          <FiSearch className="absolute left-4 top-3.5 text-gray-400 text-xl" />
        </div>

        {/* Menu Items */}
        <div className="space-y-12">
          {displayedMenu.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <p className="text-gray-500 font-medium">No dishes found matching "{searchQuery}"</p>
            </div>
          ) : (
            categories.map(cat => {
              const items = groupedMenu[cat] || [];
              if (items.length === 0) return null;
              
              return (
                <div key={cat} id={`category-${cat}`} className="scroll-mt-40">
                  <div className="flex items-end gap-2 mb-6">
                    <h2 className="text-2xl font-extrabold text-gray-900">{cat}</h2>
                    <span className="text-gray-500 font-bold mb-1">{items.length} items</span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {items.map(dish => (
                      <DishCard key={dish.id} dish={dish} />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Sticky Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 z-40 animate-[slideUp_0.3s_ease-out]">
          <div className="container mx-auto max-w-5xl">
            <div 
              onClick={() => navigate('/cart')}
              className="bg-primary hover:bg-orange-600 cursor-pointer text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between transition-colors"
            >
              <div className="flex flex-col">
                <span className="text-sm font-bold opacity-90">{cartCount} {cartCount === 1 ? 'item' : 'items'} | ₹{cartTotal}</span>
                <span className="text-xs font-semibold opacity-75">Extra charges may apply</span>
              </div>
              <div className="flex items-center gap-2 font-extrabold text-lg">
                View Cart <FiShoppingBag />
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default RestaurantDetailsPage;
