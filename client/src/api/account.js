import api from './axios';

export const accountAPI = {
  create: () => api.post('/account/').then(r => r.data),
  getAll: () => api.get('/account/').then(r => r.data),
  getBalance: (id) => api.get(`/account/balance/${id}`).then(r => r.data),
};
