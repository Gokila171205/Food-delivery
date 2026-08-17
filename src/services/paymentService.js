import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('foodrush_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const createPaymentOrder = (data) => api.post('/payments/create-order', data);
export const verifyPayment = (data) => api.post('/payments/verify', data);
export const getPaymentStatus = (orderId) => api.get(`/payments/${orderId}/status`);
