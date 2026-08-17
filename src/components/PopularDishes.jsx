import React, { useState, useEffect } from 'react';
import DishCard from './DishCard';
import { getFoods } from '../services/foodService';

const PopularDishes = () => {
  const [popularDishes, setPopularDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const response = await getFoods();
        // Just take the first 6 for home page
        setPopularDishes(response.foods.slice(0, 6));
      } catch (err) {
        console.error('Failed to fetch dishes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDishes();
  }, []);

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8">
          Popular dishes near you
        </h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse flex gap-4 bg-white p-4 rounded-2xl">
                <div className="w-32 h-32 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularDishes;
