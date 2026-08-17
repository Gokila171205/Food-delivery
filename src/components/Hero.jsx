import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-orange-50 to-orange-100 overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
      <div className="container mx-auto px-4 lg:px-8 relative z-10 flex flex-col md:flex-row items-center">
        
        {/* Text Content */}
        <div className="w-full md:w-1/2 md:pr-10 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Order delicious food from your favourite restaurants
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg">
            Discover the best food around you and get it delivered to your doorstep.
          </p>
          
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl shadow-2xl rounded-full bg-white flex items-center p-2">
            <FiSearch className="text-gray-400 text-2xl ml-4 mr-2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for biryani, pizza, burgers..." 
              className="flex-1 py-3 px-2 outline-none text-gray-700 bg-transparent"
            />
            <button type="submit" className="bg-primary hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg">
              Search
            </button>
          </form>
        </div>

        {/* Image Content */}
        <div className="w-full md:w-1/2 relative hidden md:block">
          <div className="relative w-full h-[400px] lg:h-[500px]">
            <img 
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=800&fit=crop" 
              alt="Delicious Food" 
              className="w-full h-full object-cover rounded-full shadow-2xl animate-[float_6s_ease-in-out_infinite]"
            />
            {/* Decorative elements */}
            <div className="absolute top-10 -left-10 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-[float_5s_ease-in-out_infinite_0.5s]">
              <span className="text-3xl">🍕</span>
              <div>
                <p className="font-bold text-gray-800 text-sm">Hot Pizza</p>
                <p className="text-xs text-gray-500">Delivered in 20 min</p>
              </div>
            </div>
            <div className="absolute bottom-20 -right-5 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-[float_7s_ease-in-out_infinite_1s]">
              <span className="text-3xl">⭐</span>
              <div>
                <p className="font-bold text-gray-800 text-sm">Top Rated</p>
                <p className="text-xs text-gray-500">4.8+ Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/3 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-x-1/4 translate-y-1/4"></div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </section>
  );
};

export default Hero;
