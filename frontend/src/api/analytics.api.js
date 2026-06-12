import api from './axios';
export const analyticsApi = {
  getMovement: (params) => api.get('/analytics/movement', { params }),
  getOverspeed: (params) => api.get('/analytics/overspeed', { params }),
  getParked: (params) => api.get('/analytics/parked', { params }),
  getIdle: (params) => api.get('/analytics/idle', { params }),
  getIgnition: (params) => api.get('/analytics/ignition', { params }),
  getTripSummary: (params) => api.get('/analytics/trip-summary', { params }),
  getStoppage: (params) => api.get('/analytics/stoppage', { params }),
  getRouteDeviation: (params) => api.get('/analytics/route-deviation', { params }),
};
