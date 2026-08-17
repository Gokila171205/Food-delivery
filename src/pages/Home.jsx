import React from 'react';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import Offers from '../components/Offers';
import RestaurantList from '../components/RestaurantList';
import PopularDishes from '../components/PopularDishes';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <Hero />
      <Categories />
      <Offers />
      <RestaurantList />
      <PopularDishes />
    </div>
  );
};

export default Home;
