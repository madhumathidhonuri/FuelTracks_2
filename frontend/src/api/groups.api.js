import api from './axios';
export const groupsApi = {
  getAll: (params) => api.get('/groups', { params }),
  getById: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  update: (id, data) => api.put(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`),
  addVehicles: (id, vehicleIds) => api.post(`/groups/${id}/vehicles`, { vehicleIds }),
  removeVehicles: (id, vehicleIds) => api.delete(`/groups/${id}/vehicles`, { data: { vehicleIds } }),
};
