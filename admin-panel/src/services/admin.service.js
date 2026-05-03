import api from './api';

export const adminService = {
  login: async (email, password) => {
    const res = await api.post('/user/login', { email, password });
    if (res.data.data?.token) {
      localStorage.setItem('admin_token', res.data.data.token);
      localStorage.setItem('admin_user', JSON.stringify(res.data.data.user));
    }
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },

  getStoredUser: () => {
    try { return JSON.parse(localStorage.getItem('admin_user')); } catch { return null; }
  },

  getToken: () => localStorage.getItem('admin_token'),

  getStats: () => api.get('/admin/stats').then(r => r.data),

  getCustomers: (params = {}) => api.get('/admin/customers', { params }).then(r => r.data),

  getRiders: (params = {}) => api.get('/admin/riders', { params }).then(r => r.data),

  getRides: (params = {}) => api.get('/admin/rides', { params }).then(r => r.data),

  getDisputes: (params = {}) => api.get('/admin/disputes', { params }).then(r => r.data),

  updateUserStatus: (user_id, is_active) =>
    api.patch('/admin/update-user-status', { user_id, is_active }).then(r => r.data),

  verifyRider: (rider_id, is_verified) =>
    api.patch('/admin/verify-rider', { rider_id, is_verified }).then(r => r.data),

  resolveDispute: (dispute_id, status, resolution_note) =>
    api.patch('/admin/resolve-dispute', { dispute_id, status, resolution_note }).then(r => r.data),
};
