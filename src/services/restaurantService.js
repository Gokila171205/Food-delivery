import api from './api';

export const normalizeRestaurant = (res) => {
  return {
    ...res,
    id: res._id,
    time: res.deliveryTime ? `${res.deliveryTime} mins` : '30 mins',
    priceForTwo: res.priceForTwo ? `₹${res.priceForTwo} for two` : '₹300 for two',
    distance: res.location || 'Nearby', // Using location as distance fallback for now
    offer: res.offers && res.offers.length > 0 ? (res.offers[0].title || 'Offers Available') : '',
  };
};

export const getRestaurants = async (params = {}) => {
  const { data } = await api.get('/restaurants', { params });
  return {
    ...data,
    restaurants: data.restaurants.map(normalizeRestaurant)
  };
};

export const getRestaurantById = async (id) => {
  const { data } = await api.get(`/restaurants/${id}`);
  return {
    ...data,
    restaurant: normalizeRestaurant(data.restaurant)
  };
};

export const searchRestaurants = async (query) => {
  const { data } = await api.get('/restaurants', { params: { search: query } });
  return {
    ...data,
    restaurants: data.restaurants.map(normalizeRestaurant)
  };
};
