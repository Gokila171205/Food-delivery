import React from 'react';
import { categories } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

const Categories = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (name) => {
    navigate(`/restaurants?category=${encodeURIComponent(name)}`);
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">What's on your mind?</h2>
        </div>
        
        <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-4">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
              onClick={() => handleCategoryClick(category.name)}
            >
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mb-3 shadow-md border-4 border-transparent group-hover:border-primary transition-all duration-300 relative">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
              </div>
              <span className="font-semibold text-gray-700 group-hover:text-primary transition-colors">
                {category.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
