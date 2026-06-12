import api from './axios';
export const historyApi = {
  getRoute: (vehicleId, startDate, endDate) => api.get(`/history/route/${vehicleId}`, { params: { startDate, endDate } }),
  getStops: (vehicleId, startDate, endDate) => api.get(`/history/stops/${vehicleId}`, { params: { startDate, endDate } }),
  getTrips: (vehicleId, startDate, endDate) => api.get(`/history/trips/${vehicleId}`, { params: { startDate, endDate } }),
};
