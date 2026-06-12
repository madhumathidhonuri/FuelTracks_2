import api from './axios';

export const calibrationApi = {
  list: (params) => api.get('/calibrations', { params }),
  get: (id) => api.get(`/calibrations/${id}`),
  create: (data) => api.post('/calibrations', data),
  update: (id, data) => api.put(`/calibrations/${id}`, data),
  remove: (id) => api.delete(`/calibrations/${id}`),
  interpolate: (vehicleId, rawValue) => api.get('/calibrations/interpolate', { params: { vehicle_id: vehicleId, raw_value: rawValue } }),
};

export default calibrationApi;
