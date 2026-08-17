import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchFoods } from '../services/foodService';
import { searchRestaurants } from '../services/restaurantService';
import RestaurantCard from '../components/RestaurantCard';
import DishCard from '../components/DishCard';
import { FiSearch } from 'react-icons/fi';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [matchedFood, setMatchedFood] = useState([]);
  const [matchedRes, setMatchedRes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const [foodRes, restaurantRes] = await Promise.all([
          searchFoods(query),
          searchRestaurants(query)
        ]);
        
        setMatchedFood(foodRes.foods);
        setMatchedRes(restaurantRes.restaurants);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to fetch search results. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [query]);

  const hasResults = matchedFood.length > 0 || matchedRes.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-20 md:pb-8">
      <div className="container mx-auto px-4 lg:px-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8">
          Search results for "{query}"
        </h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-500 font-medium">Searching for "{query}"...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{error}</h2>
            <button onClick={() => window.location.reload()} className="mt-4 bg-primary text-white font-bold px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">Retry</button>
          </div>
        ) : !hasResults ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FiSearch className="text-6xl text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No results found</h2>
            <p className="text-gray-500 mb-6 max-w-md">
              We couldn't find anything matching "{query}". Try searching for something else like Biryani, Pizza, or Burger.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {matchedFood.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6 uppercase tracking-wider">Food</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchedFood.map(dish => (
                    <DishCard key={dish.id} dish={dish} />
                  ))}
                </div>
              </div>
            )}

            {matchedRes.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6 uppercase tracking-wider">Restaurants</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                  {matchedRes.map(res => (
                    <RestaurantCard key={res.id} restaurant={res} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
