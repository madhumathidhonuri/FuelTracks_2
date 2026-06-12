import api from './axios';
export const vehiclesApi = {
  getAll: (params) => api.get('/vehicles', { params }),
  list: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  get: (id) => api.get(`/vehicles/${id}`),
  getStatusAll: () => api.get('/vehicles/status/all'),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
  remove: (id) => api.delete(`/vehicles/${id}`),
  search: (query) => api.get('/vehicles/search', { params: { q: query } }),
};
