import api from './api';

export const normalizeFood = (food) => {
  return {
    ...food,
    id: food._id,
    restaurantId: typeof food.restaurant === 'object' ? food.restaurant._id : food.restaurant,
    restaurant: typeof food.restaurant === 'object' ? food.restaurant.name : 'Unknown Restaurant',
    available: food.isAvailable,
  };
};

export const getFoods = async (params = {}) => {
  const { data } = await api.get('/foods', { params });
  return {
    ...data,
    foods: data.foods.map(normalizeFood)
  };
};

export const getFoodById = async (id) => {
  const { data } = await api.get(`/foods/${id}`);
  return {
    ...data,
    food: normalizeFood(data.food)
  };
};

export const getFoodsByRestaurant = async (restaurantId) => {
  const { data } = await api.get('/foods', { params: { restaurant: restaurantId } });
  return {
    ...data,
    foods: data.foods.map(normalizeFood)
  };
};

export const searchFoods = async (query) => {
  const { data } = await api.get('/foods', { params: { search: query } });
  return {
    ...data,
    foods: data.foods.map(normalizeFood)
  };
};
