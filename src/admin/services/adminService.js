import axios from 'axios';

const adminApi = axios.create({ baseURL: 'http://localhost:5000/api/admin' });

adminApi.interceptors.request.use(config => {
  const token = sessionStorage.getItem('foodrush_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getDashboardStats = () => adminApi.get('/dashboard');

// Users
export const getUsers = () => adminApi.get('/users');
export const updateUser = (id, data) => adminApi.put(`/users/${id}`, data);
export const deleteUser = (id) => adminApi.delete(`/users/${id}`);

// Restaurants
export const getRestaurants = () => adminApi.get('/restaurants');
export const createRestaurant = (data) => adminApi.post('/restaurants', data);
export const updateRestaurant = (id, data) => adminApi.put(`/restaurants/${id}`, data);
export const deleteRestaurant = (id) => adminApi.delete(`/restaurants/${id}`);

// Foods
export const getFoods = () => adminApi.get('/foods');
export const createFood = (data) => adminApi.post('/foods', data);
export const updateFood = (id, data) => adminApi.put(`/foods/${id}`, data);
export const deleteFood = (id) => adminApi.delete(`/foods/${id}`);

// Orders
export const getOrders = () => adminApi.get('/orders');
export const updateOrderStatus = (id, status) => adminApi.put(`/orders/${id}/status`, { status });

// Coupons
export const getCoupons = () => adminApi.get('/coupons');
export const createCoupon = (data) => adminApi.post('/coupons', data);
export const updateCoupon = (id, data) => adminApi.put(`/coupons/${id}`, data);
export const deleteCoupon = (id) => adminApi.delete(`/coupons/${id}`);

export default adminApi;
