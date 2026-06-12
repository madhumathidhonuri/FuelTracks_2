import api from './axios';

export const tagsApi = {
  list: (params) => api.get('/tags', { params }),
  get: (id) => api.get(`/tags/${id}`),
  create: (data) => api.post('/tags', data),
  update: (id, data) => api.put(`/tags/${id}`, data),
  delete: (id) => api.delete(`/tags/${id}`),
  assignToVehicle: (id, vehicleId) => api.post(`/tags/${id}/assign`, { vehicle_id: vehicleId }),
  removeFromVehicle: (id, vehicleId) => api.post(`/tags/${id}/unassign`, { vehicle_id: vehicleId }),
};

export default tagsApi;
