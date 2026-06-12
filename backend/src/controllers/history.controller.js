const Location = require('../models/Location');
const Trip = require('../models/Trip');

const getRoute = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ success: false, message: 'from and to dates required' });

    const vehicleId = req.params.vehicleId;
    const locations = await Location.findByVehicleAndDateRange(vehicleId, from, to);

    const route = locations.map(l => ({
      lat: l.latitude,
      lng: l.longitude,
      speed: l.speed,
      ignition: l.ignition,
      time: l.server_time,
      heading: l.heading,
    }));

    return res.json({ success: true, data: { route, totalPoints: route.length } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch route' });
  }
};

const getStops = async (req, res) => {
  try {
    const { from, to } = req.query;
    const vehicleId = req.params.vehicleId;

    const locations = await Location.findByVehicleAndDateRange(vehicleId, from, to);
    const stops = [];
    let stopStart = null;

    for (const loc of locations) {
      if (!loc.ignition && loc.speed === 0) {
        if (!stopStart) stopStart = { ...loc, stopStartTime: loc.server_time };
      } else {
        if (stopStart) {
          const duration = (new Date(loc.server_time) - new Date(stopStart.stopStartTime)) / 1000;
          if (duration >= 60) {
            stops.push({
              startTime: stopStart.stopStartTime,
              endTime: loc.server_time,
              duration: Math.round(duration),
              latitude: stopStart.latitude,
              longitude: stopStart.longitude,
            });
          }
          stopStart = null;
        }
      }
    }

    return res.json({ success: true, data: stops });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch stops' });
  }
};

const getTrips = async (req, res) => {
  try {
    const { from, to, page = 1, limit = 20 } = req.query;
    const result = await Trip.findByVehicle(req.params.vehicleId, { from, to, page: parseInt(page), limit: parseInt(limit) });
    return res.json({ success: true, data: result.data, total: result.total });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch trips' });
  }
};

module.exports = { getRoute, getStops, getTrips };