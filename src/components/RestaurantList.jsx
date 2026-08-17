import React, { useState, useEffect } from 'react';
import RestaurantCard from './RestaurantCard';
import { getRestaurants } from '../services/restaurantService';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await getRestaurants({ limit: 4 });
        // In case the API returns all, we slice it to top 4 for the home page
        setRestaurants(response.restaurants.slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch restaurants:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8">
          Top restaurants near you
        </h2>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl h-48 mb-4"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RestaurantList;
