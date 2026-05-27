import api from './axios';

export const authAPI = {
  register: (data) => api.post('/user/register', data).then(r => r.data),
  login: (data) => api.post('/user/login', data).then(r => r.data),
  logout: () => api.post('/user/logout').then(r => r.data),
};
