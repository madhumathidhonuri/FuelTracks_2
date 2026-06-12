import api from './axios';
export const trackingApi = {
  getLiveTracking: () => api.get('/tracking/live'),
  getLiveTrackingByVehicle: (vehicleId) => api.get(`/tracking/live/${vehicleId}`),
  getFleetStatus: () => api.get('/tracking/fleet-status'),
};
