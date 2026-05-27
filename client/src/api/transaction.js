import api from './axios';

export const transactionAPI = {
  transfer: (data) => api.post('/transaction/', data).then(r => r.data),
  addFunds: (data) => api.post('/transaction/initial-funds', data).then(r => r.data),
};
