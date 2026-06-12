require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const net = require('net');

// Import TCP Server Manager (runs all protocol servers)
const { startAllServers, stopAllServers } = require('./tcp');

const env = require('./config/env');
const { initSocket, emitLocationUpdate } = require('./config/socket');
const Location = require('./models/Location');
const Vehicle = require('./models/Vehicle');
const { processLocation } = require('./services/alert.service');
const { audit } = require('./middleware/audit.middleware');

const app = express();
const server = http.createServer(app);

// Socket.io
initSocket(server);

// Middleware
app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
}));

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try later.' },
});
app.use('/api/', limiter);

// Audit middleware
app.use(audit);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'FuelTracks API', 
    timestamp: new Date().toISOString(), 
    uptime: process.uptime(),
    tcpServers: {
      ais140: process.env.TCP_AIS140_PORT || 9001,
      bstp15: process.env.TCP_BSTP15_PORT || 9002,
      bstpl17: process.env.TCP_BSTPL17_PORT || 9003,
    }
  });
});

// Routes
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/organizations', require('./routes/organization.routes'));
app.use('/api/v1/devices', require('./routes/device.routes'));
app.use('/api/v1/vehicles', require('./routes/vehicle.routes'));
app.use('/api/v1/groups', require('./routes/group.routes'));
app.use('/api/v1/users', require('./routes/user.routes'));
app.use('/api/v1/tracking', require('./routes/tracking.routes'));
app.use('/api/v1/history', require('./routes/history.routes'));
app.use('/api/v1/reports', require('./routes/reports.routes'));
app.use('/api/v1/analytics', require('./routes/analytics.routes'));
app.use('/api/v1/statistics', require('./routes/statistics.routes'));
app.use('/api/v1/sensors', require('./routes/sensor.routes'));
app.use('/api/v1/alerts', require('./routes/alert.routes'));

// Legacy TCP Server (port 9000) - for backward compatibility
const LEGACY_PORT = parseInt(process.env.GPS_PORT) || 9000;
const legacyServer = net.createServer((socket) => {
  console.log(`[LEGACY] Device connected: ${socket.remoteAddress}:${socket.remotePort}`);

  let buffer = '';

  socket.on('data', async (data) => {
    buffer += data.toString();
    const messages = buffer.split('\n');
    buffer = messages.pop();

    for (const rawMessage of messages) {
      if (!rawMessage.trim()) continue;

      try {
        const parts = rawMessage.split(',');
        if (parts.length < 10) continue;

        const imei = parts[0].replace('imei:', '');
        const latitude = parseFloat(parts[3]);
        const longitude = parseFloat(parts[4]);

        if (isNaN(latitude) || isNaN(longitude)) continue;

        const deviceResult = await require('./models/Device').findByImei(imei);
        if (!deviceResult) continue;

        const vehicle = await Vehicle.findByDeviceId(deviceResult.id);
        if (!vehicle) continue;

        const location = await Location.create({
          device_id: deviceResult.id,
          vehicle_id: vehicle.id,
          latitude,
          longitude,
          speed: parseFloat(parts[5]) || 0,
          heading: parseFloat(parts[6]) || 0,
          ignition: parseInt(parts[7]) === 1,
          altitude: parseFloat(parts[8]) || 0,
          odometer: parseFloat(parts[9]) || 0,
          satellites: parseInt(parts[10]) || 0,
          server_time: new Date(),
          raw_message: rawMessage,
        });

        emitLocationUpdate(vehicle.id, { ...location, organization_id: vehicle.organization_id });

        const io = require('./config/socket').getIO();
        if (io) await processLocation(location, io);

        socket.write('ACK\n');
      } catch (err) {
        console.error('[LEGACY] Parse error:', err.message);
      }
    }
  });

  socket.on('error', (err) => console.error('[LEGACY] Socket error:', err.message));
  socket.on('close', () => console.log(`[LEGACY] Device disconnected: ${socket.remoteAddress}`));
});

legacyServer.on('error', (err) => console.error('[LEGACY] Server error:', err.message));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: env.nodeEnv === 'development' ? err.message : 'Internal server error',
  });
});

// Start server
server.listen(env.port, () => {
  console.log(`\n🚀 FuelTracks API running on port ${env.port}`);
  console.log(`   Environment: ${env.nodeEnv}`);
  console.log(`   Frontend: ${env.frontendUrl}`);
  console.log(`   Socket.io enabled\n`);
});

// Legacy TCP Server (port 9000)
legacyServer.listen(LEGACY_PORT, () => {
  console.log(`📡 [LEGACY] TCP Server listening on port ${LEGACY_PORT}`);
});

// Start all protocol TCP servers (AIS-140, BSTP-15, BSTPL-17)
startAllServers();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\nSIGTERM received, shutting down gracefully...');
  stopAllServers();
  legacyServer.close(() => {
    server.close(() => {
      console.log('All servers closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  stopAllServers();
  legacyServer.close(() => {
    server.close(() => {
      console.log('All servers closed');
      process.exit(0);
    });
  });
});

module.exports = { app, server };