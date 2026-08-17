import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getRestaurants } from '../services/restaurantService';
import RestaurantCard from '../components/RestaurantCard';

const FavouritesPage = () => {
  const { favorites } = useAppContext();
  const navigate = useNavigate();
  
  const [favoriteRestaurants, setFavoriteRestaurants] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchFavs = async () => {
      try {
        const response = await getRestaurants();
        const favs = response.restaurants.filter(r => favorites.some(id => String(id) === String(r.id)));
        setFavoriteRestaurants(favs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavs();
  }, [favorites]);

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-24 md:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Favourites</h1>

        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          </div>
        ) : favoriteRestaurants.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
            <div className="text-6xl mb-6">❤️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No favourites yet</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Save restaurants you love and find them here for quick access.</p>
            <button 
              onClick={() => navigate('/restaurants')}
              className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-orange-600 transition-colors shadow-lg"
            >
              Explore Restaurants
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {favoriteRestaurants.map(restaurant => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavouritesPage;
