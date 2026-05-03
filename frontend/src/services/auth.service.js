import api from './api';

export const authService = {
  sendOtp: async (phone) => {
    const res = await api.post('/user/send-otp', { phone });
    return res.data;
  },

  verifyOtp: async (phone, otp) => {
    const res = await api.post('/user/verify-otp', { phone, otp });
    if (res.data.data?.token) {
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
    }
    return res.data;
  },

  login: async (email, password) => {
    const res = await api.post('/user/login', { email, password });
    if (res.data.data?.token) {
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
    }
    return res.data;
  },

  signup: async (payload) => {
    const res = await api.post('/user/signup', payload);
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getStoredUser: () => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  },

  getToken: () => localStorage.getItem('token'),
};
