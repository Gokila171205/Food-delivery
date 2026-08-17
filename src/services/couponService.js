import api from './api';

export const getValidCoupons = () => {
  return api.get('/coupons');
};

export const validateCoupon = (code, cart) => {
  return api.post('/coupons/validate', { code, cart });
};
