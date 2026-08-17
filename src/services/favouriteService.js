import api from './api';

export const getFavourites = () => {
  return api.get('/favourites');
};

export const addFavourite = (restaurantId) => {
  return api.post('/favourites', { restaurant: restaurantId });
};

export const removeFavourite = (id) => {
  return api.delete(`/favourites/${id}`);
};
