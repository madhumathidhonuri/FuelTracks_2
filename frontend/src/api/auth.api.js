import api from './axios';
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};
