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
  }
};
