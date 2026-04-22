import api from './api';

export const walletService = {
  getAll: async () => {
    const response = await api.get('/wallet');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/wallet/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/wallet', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/wallet/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/wallet/${id}`);
    return response.data;
  }
};
