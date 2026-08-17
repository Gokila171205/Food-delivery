import axios from 'axios';

const ownerApi = axios.create({ baseURL: 'http://localhost:5000/api/owner' });

ownerApi.interceptors.request.use(config => {
  const token = sessionStorage.getItem('foodrush_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getOwnerDashboardStats = () => ownerApi.get('/dashboard');

// Restaurant
export const getOwnerRestaurant = () => ownerApi.get('/restaurant');
export const updateOwnerRestaurant = (data) => ownerApi.put('/restaurant', data);

// Foods
export const getOwnerFoods = () => ownerApi.get('/foods');
export const createOwnerFood = (data) => ownerApi.post('/foods', data);
export const updateOwnerFood = (id, data) => ownerApi.put(`/foods/${id}`, data);
export const deleteOwnerFood = (id) => ownerApi.delete(`/foods/${id}`);

// Orders
export const getOwnerOrders = () => ownerApi.get('/orders');
export const updateOwnerOrderStatus = (id, status) => ownerApi.put(`/orders/${id}/status`, { status });

export default ownerApi;
