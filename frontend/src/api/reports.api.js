import api from './axios';
export const reportsApi = {
  getConsolidated: (params) => api.get('/reports/consolidated', { params }),
  getOverspeed: (params) => api.get('/reports/overspeed', { params }),
  getStoppage: (params) => api.get('/reports/stoppage', { params }),
  getTripHistory: (params) => api.get('/reports/trip-history', { params }),
  getRouteSummary: (params) => api.get('/reports/route-summary', { params }),
  exportReport: (type, params) => api.get(`/reports/export/${type}`, { params, responseType: 'blob' }),
};
