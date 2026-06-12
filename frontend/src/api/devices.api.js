import api from './axios';
export const devicesApi = {
  getAll: (params) => api.get('/devices', { params }),
  getById: (id) => api.get(`/devices/${id}`),
  checkImei: (imei) => api.get('/devices/check-imei', { params: { imei } }),
  onboardDevice: (data) => api.post('/devices/onboard', data),
};
