import React from 'react';
import { FiHeart, FiStar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useAppContext();
  const isFavorite = favorites.some(id => String(id) === String(restaurant.id));

  return (
    <div 
      className="group cursor-pointer"
      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
    >
      <div className="relative overflow-hidden rounded-2xl shadow-sm group-hover:shadow-xl transition-shadow duration-300">
        <div className="relative h-48 md:h-56 w-full">
          <img 
            src={restaurant.image} 
            alt={restaurant.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          {restaurant.offer && (
            <div className="absolute bottom-3 left-3 text-white font-extrabold text-xl tracking-tight uppercase">
              {restaurant.offer}
            </div>
          )}

          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(restaurant.id);
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors"
          >
            <FiHeart className={`text-lg transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className="pt-3 px-1">
        <h3 className="font-bold text-lg text-gray-800 truncate group-hover:text-primary transition-colors">
          {restaurant.name}
        </h3>
        
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1 bg-green-600 text-white px-1.5 py-0.5 rounded text-xs font-bold">
            <FiStar /> {restaurant.rating}
          </div>
          <span className="text-gray-500 text-sm font-medium">•</span>
          <span className="text-gray-700 text-sm font-semibold">{restaurant.time}</span>
        </div>
        
        <p className="text-gray-500 text-sm mt-1 truncate">
          {restaurant.cuisines.join(', ')}
        </p>
        <p className="text-gray-500 text-sm mt-0.5 truncate">
          {restaurant.distance} • {restaurant.priceForTwo}
        </p>
      </div>
    </div>
  );
};

export default RestaurantCard;
