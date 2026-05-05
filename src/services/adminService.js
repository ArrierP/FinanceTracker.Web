import api from './api';

export const adminService = {
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  lockUser: async (id) => {
    const response = await api.post(`/admin/lock/${id}`);
    return response.data;
  },
  unlockUser: async (id) => {
    const response = await api.post(`/admin/unlock/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getDefaultCategories: async () => {
    const response = await api.get('/admin/categories/defaults');
    return response.data;
  },

  createDefaultCategory: async (categoryData) => {
    const response = await api.post('/admin/categories/defaults', categoryData);
    return response.data;
  },
  
  updateDefaultCategory: async (id, categoryData) => {
    const response = await api.put(`/admin/categories/defaults/${id}`, categoryData);
    return response.data;
  },

  deleteDefaultCategory: async (id) => {
    const response = await api.delete(`/admin/categories/defaults/${id}`);
    return response.data;
  }
};
