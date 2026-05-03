import api from './api';

export const userService = {
  getProfile: async () => {
    const res = await api.get('/user/profile');
    return res.data;
  },

  updateProfile: async (payload) => {
    const res = await api.patch('/user/profile', payload);
    return res.data;
  },
};
