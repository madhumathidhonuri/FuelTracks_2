const Location = require('../models/Location');
const Trip = require('../models/Trip');
const Alert = require('../models/Alert');
const { calculateDistance } = require('../utils/geo.utils');

const getConsolidatedReport = async (vehicleId, from, to, organizationId) => {
  const locations = await Location.findByVehicleAndDateRange(vehicleId, from, to);
  const trips = await Trip.findByVehicle(vehicleId, { from, to, page: 1, limit: 100 });

  let totalDistance = 0;
  let totalDuration = 0;
  let maxSpeed = 0;
  let idleCount = 0;
  let ignitionOnCount = 0;
  let ignitionOffCount = 0;

  if (locations.length > 1) {
    for (let i = 1; i < locations.length; i++) {
      const dist = calculateDistance(
        locations[i - 1].latitude, locations[i - 1].longitude,
        locations[i].latitude, locations[i].longitude
      );
      totalDistance += dist;
      if (locations[i].speed > maxSpeed) maxSpeed = locations[i].speed;
      if (locations[i].ignition) ignitionOnCount++; else ignitionOffCount++;
      if (locations[i].ignition && locations[i].speed === 0) idleCount++;
    }
    const timeDiff = new Date(locations[locations.length - 1].server_time) - new Date(locations[0].server_time);
    totalDuration = Math.round(timeDiff / 1000);
  }

  return {
    vehicleId,
    dateRange: { from, to },
    distance: Math.round(totalDistance * 100) / 100,
    duration: totalDuration,
    maxSpeed,
    tripCount: trips.data?.length || 0,
    ignitionOnCount,
    ignitionOffCount,
    idleCount,
    data: locations,
  };
};

const getOverspeedReport = async (vehicleId, from, to, overspeedLimit) => {
  const alerts = await Alert.getByType(null, 'overspeed', from, to);
  return alerts.filter(a => {
    if (vehicleId && a.vehicle_id !== vehicleId) return false;
    return a.speed && a.speed > (overspeedLimit || 80);
  });
};

const getStoppageReport = async (vehicleId, from, to) => {
  const locations = await Location.findByVehicleAndDateRange(vehicleId, from, to);
  const stops = [];
  let stopStart = null;

  for (const loc of locations) {
    if (!loc.ignition && loc.speed === 0) {
      if (!stopStart) stopStart = loc;
    } else {
      if (stopStart) {
        const duration = (new Date(loc.server_time) - new Date(stopStart.server_time)) / 1000;
        if (duration >= 60) {
          stops.push({ start: stopStart, end: loc, duration: Math.round(duration) });
        }
        stopStart = null;
      }
    }
  }

  return stops;
};

const getTripHistoryReport = async (vehicleId, from, to) => {
  const result = await Trip.findByVehicle(vehicleId, { from, to, page: 1, limit: 500 });
  return result.data || [];
};

const getRouteSummary = async (vehicleId, from, to) => {
  const locations = await Location.findByVehicleAndDateRange(vehicleId, from, to);
  const trips = await Trip.findByVehicle(vehicleId, { from, to, page: 1, limit: 100 });

  let totalDistance = 0;
  if (locations.length > 1) {
    for (let i = 1; i < locations.length; i++) {
      totalDistance += calculateDistance(
        locations[i - 1].latitude, locations[i - 1].longitude,
        locations[i].latitude, locations[i].longitude
      );
    }
  }

  let totalTripDuration = 0;
  let totalIdleTime = 0;
  const tripData = trips.data || [];

  tripData.forEach(t => {
    totalTripDuration += t.duration || 0;
    totalIdleTime += t.idle_time || 0;
  });

  return {
    vehicleId,
    totalDistance: Math.round(totalDistance * 100) / 100,
    totalDuration: totalTripDuration,
    tripCount: tripData.length,
    idleTime: totalIdleTime,
    movingTime: totalTripDuration - totalIdleTime,
    routePoints: locations.map(l => ({ lat: l.latitude, lng: l.longitude, time: l.server_time, speed: l.speed })),
  };
};

module.exports = {
  getConsolidatedReport,
  getOverspeedReport,
  getStoppageReport,
  getTripHistoryReport,
  getRouteSummary,
};