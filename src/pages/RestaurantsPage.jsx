import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getRestaurants } from '../services/restaurantService';
import RestaurantCard from '../components/RestaurantCard';
import { FiFilter, FiX } from 'react-icons/fi';

const sortOptions = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'rating', label: 'Rating: High to Low' },
  { id: 'time', label: 'Delivery Time: Low to High' },
  { id: 'price_low', label: 'Price: Low to High' },
  { id: 'price_high', label: 'Price: High to Low' }
];

const parsePrice = (priceStr) => {
  const match = priceStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

const parseTime = (timeStr) => {
  const match = timeStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

const RestaurantsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filters State
  const [sort, setSort] = useState('relevance');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [isPureVeg, setIsPureVeg] = useState(false);
  const [timeFilter, setTimeFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');
  const [offersFilter, setOffersFilter] = useState('All');

  // We map categories clicked from Home page, they might just be a filter on cuisines
  // If there's a category in URL, we apply it initially. Let's keep it as a cuisine filter essentially.
  const [category, setCategory] = useState(initialCategory);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};

        if (category !== 'All') {
          params.search = category;
        }

        if (ratingFilter !== 'All') {
          params.rating = parseFloat(ratingFilter);
        }

        if (timeFilter === 'Under 30 mins') {
          params.deliveryTime = 30;
        } else if (timeFilter === '30-45 mins') {
          params.deliveryTime = 45;
        }

        if (priceFilter === '₹0-200') {
          params.price = 200;
        } else if (priceFilter === '₹200-400') {
          params.price = 400;
        }

        if (sort === 'rating') {
          params.sort = 'rating';
        } else if (sort === 'time') {
          params.sort = 'deliveryTime';
        } else if (sort === 'price_low') {
          params.sort = 'price';
        }

        const response = await getRestaurants(params);
        let result = response.restaurants;

        // Apply filters not supported by backend natively
        if (isPureVeg) {
          result = result.filter(r => !r.cuisines.some(c => c.toLowerCase().includes('biryani') || c.toLowerCase().includes('mughlai') || c.toLowerCase().includes('american')));
        }
        if (offersFilter === 'Restaurants with offers') {
          result = result.filter(r => r.offer);
        }
        if (sort === 'price_high') {
          result.sort((a, b) => parsePrice(b.priceForTwo) - parsePrice(a.priceForTwo));
        }

        setRestaurants(result);
      } catch (err) {
        console.error('Failed to fetch restaurants:', err);
        setError('Unable to load restaurants. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [category, sort, ratingFilter, isPureVeg, timeFilter, priceFilter, offersFilter]);

  const clearFilters = () => {
    setCategory('All');
    setSort('relevance');
    setRatingFilter('All');
    setIsPureVeg(false);
    setTimeFilter('All');
    setPriceFilter('All');
    setOffersFilter('All');
    setSearchParams({}); // clear URL params
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold mb-3 text-gray-800">Sort By</h3>
        <div className="flex flex-col gap-2">
          {sortOptions.map(opt => (
            <label key={opt.id} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="radio" name="sort" checked={sort === opt.id} onChange={() => setSort(opt.id)} className="accent-primary" />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="font-bold mb-3 text-gray-800">Rating</h3>
        <div className="flex flex-col gap-2">
          {['All', '4.5+', '4.0+', '3.5+'].map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="radio" name="rating" checked={ratingFilter === opt} onChange={() => setRatingFilter(opt)} className="accent-primary" />
              {opt}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-3 text-gray-800">Dietary</h3>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
          <input type="checkbox" checked={isPureVeg} onChange={(e) => setIsPureVeg(e.target.checked)} className="accent-primary w-4 h-4" />
          Pure Veg
        </label>
      </div>

      <div>
        <h3 className="font-bold mb-3 text-gray-800">Delivery Time</h3>
        <div className="flex flex-col gap-2">
          {['All', 'Under 30 mins', '30-45 mins', '45+ mins'].map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="radio" name="time" checked={timeFilter === opt} onChange={() => setTimeFilter(opt)} className="accent-primary" />
              {opt}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-3 text-gray-800">Price</h3>
        <div className="flex flex-col gap-2">
          {['All', '₹0-200', '₹200-400', '₹400+'].map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="radio" name="price" checked={priceFilter === opt} onChange={() => setPriceFilter(opt)} className="accent-primary" />
              {opt}
            </label>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="font-bold mb-3 text-gray-800">Offers</h3>
        <div className="flex flex-col gap-2">
          {['All', 'Restaurants with offers'].map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="radio" name="offers" checked={offersFilter === opt} onChange={() => setOffersFilter(opt)} className="accent-primary" />
              {opt}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-20 md:pb-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            {category !== 'All' ? `${category} Restaurants near you` : 'Restaurants near you'}
          </h1>
          <button 
            className="md:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-gray-700 font-bold"
            onClick={() => setIsMobileFilterOpen(true)}
          >
            <FiFilter /> Filters
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop Sidebar Filters */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-28">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-extrabold text-gray-900">Filters</h2>
                <button onClick={clearFilters} className="text-sm font-bold text-primary hover:underline">Clear</button>
              </div>
              <FilterContent />
            </div>
          </div>

          {/* Restaurant Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-2xl h-48 mb-4"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{error}</h2>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-primary text-white font-bold px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : restaurants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No restaurants found</h2>
                <p className="text-gray-500 mb-6 max-w-sm">
                  Try changing your filters or searching for something else.
                </p>
                <button 
                  onClick={clearFilters}
                  className="bg-primary text-white font-bold px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                {restaurants.map(res => (
                  <RestaurantCard key={res.id} restaurant={res} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)}></div>
          <div className="relative bg-white w-full max-h-[85vh] rounded-t-3xl shadow-2xl flex flex-col animate-[slideUp_0.3s_ease-out]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-extrabold text-gray-900">Filters</h2>
              <button onClick={() => setIsMobileFilterOpen(false)} className="text-gray-500 hover:text-gray-900"><FiX className="text-2xl" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <FilterContent />
            </div>
            
            <div className="p-4 border-t border-gray-100 flex gap-4 bg-white">
              <button onClick={clearFilters} className="flex-1 py-3 font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200">Clear All</button>
              <button onClick={() => setIsMobileFilterOpen(false)} className="flex-1 py-3 font-bold text-white bg-primary rounded-xl hover:bg-orange-600 shadow-md">Apply</button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default RestaurantsPage;
