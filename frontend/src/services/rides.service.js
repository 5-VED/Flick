import api from './api';

export const ridesService = {
  bookRide: async (payload) => {
    const res = await api.post('/rides/book-ride', payload);
    return res.data;
  },

  cancelRide: async (ride_id, reason) => {
    const res = await api.put('/rides/cancel-ride', { ride_id, reason });
    return res.data;
  },

  getRideHistory: async ({ page = 1, limit = 20, status = 'all' } = {}) => {
    const res = await api.get('/rides/history', { params: { page, limit, status } });
    return res.data;
  },

  getRide: async (id) => {
    const res = await api.get(`/rides/${id}`);
    return res.data;
  },

  updateStatus: async (ride_id, status, extra = {}) => {
    const res = await api.patch('/rides/update-status', { ride_id, status, ...extra });
    return res.data;
  },

  rateRide: async (ride_id, rating, review, tip, payment_method) => {
    const res = await api.post('/rides/rate', { ride_id, rating, review, tip, payment_method });
    return res.data;
  },
};
