import api from './api';

export const getAddresses = () => {
  return api.get('/addresses');
};

export const addAddress = (address) => {
  return api.post('/addresses', address);
};

export const editAddress = (id, updatedAddress) => {
  return api.put(`/addresses/${id}`, updatedAddress);
};

export const deleteAddress = (id) => {
  return api.delete(`/addresses/${id}`);
};

export const setDefaultAddress = (id) => {
  return api.put(`/addresses/${id}/default`);
};
