import api from './axios';
export const statisticsApi = {
  getDistance: (params) => api.get('/statistics/distance', { params }),
  getDriverPerformance: (params) => api.get('/statistics/driver-performance', { params }),
  getVehiclePerformance: (params) => api.get('/statistics/vehicle-performance', { params }),
};
