const { Server } = require('socket.io');
const jwt = require('../utils/jwt.utils');
const Location = require('../models/Location');
const { processLocation } = require('../services/alert.service');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      const decoded = jwt.verifyAccessToken(token);
      if (decoded) {
        socket.user = decoded;
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}, user: ${socket.user?.username || 'anonymous'}`);

    if (socket.user) {
      socket.join(`org_${socket.user.organizationId}`);
      socket.join(`user_${socket.user.id}`);

      socket.emit('connected', { socketId: socket.id, user: socket.user.username });
    }

    socket.on('subscribe:vehicle', (vehicleId) => {
      socket.join(`vehicle_${vehicleId}`);
      console.log(`User ${socket.user?.username} subscribed to vehicle ${vehicleId}`);
    });

    socket.on('unsubscribe:vehicle', (vehicleId) => {
      socket.leave(`vehicle_${vehicleId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const emitLocationUpdate = (vehicleId, locationData) => {
  if (!io) return;
  io.to(`vehicle_${vehicleId}`).emit('location:update', {
    vehicleId,
    lat: locationData.latitude,
    lng: locationData.longitude,
    speed: locationData.speed,
    odometer: locationData.odometer,
    ignition: locationData.ignition,
    heading: locationData.heading,
    deviceTime: locationData.device_time,
  });

  io.to(`org_${locationData.organization_id}`).emit('location:update', {
    vehicleId,
    lat: locationData.latitude,
    lng: locationData.longitude,
    speed: locationData.speed,
    odometer: locationData.odometer,
    ignition: locationData.ignition,
    heading: locationData.heading,
    deviceTime: locationData.device_time,
  });
};

const emitAlert = (organizationId, alertData) => {
  if (!io) return;
  io.to(`org_${organizationId}`).emit('alert:new', alertData);
};

const emitVehicleStatus = (organizationId, vehicleId, status) => {
  if (!io) return;
  io.to(`org_${organizationId}`).emit('vehicle:status:change', { vehicleId, status });
  io.to(`vehicle_${vehicleId}`).emit('vehicle:status:change', { vehicleId, status });
};

const getIO = () => io;

module.exports = { initSocket, emitLocationUpdate, emitAlert, emitVehicleStatus, getIO };