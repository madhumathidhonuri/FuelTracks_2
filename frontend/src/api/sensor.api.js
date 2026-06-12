import api from './axios';
export const sensorApi = {
  getIdleWastage: (params) => api.get('/sensors/idle-wastage', { params }),
  getEngineOn: (params) => api.get('/sensors/engine-on', { params }),
  getProtocol: (params) => api.get('/sensors/protocol', { params }),
  getDeviceData: (params) => api.get('/sensors/data', { params }),
  exportSensors: (params) => api.get('/sensors/export', { params, responseType: 'blob' }),
};
