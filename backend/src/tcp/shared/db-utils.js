/**
 * Shared Database Utilities for TCP Servers
 * Common functions used across all protocol servers
 */

const Location = require('../../models/Location');
const Vehicle = require('../../models/Vehicle');
const Device = require('../../models/Device');
const Alert = require('../../models/Alert');

// Track connected devices per protocol
const connectedDevices = {
  ais140: new Map(),
  bstp15: new Map(),
  bstpl17: new Map(),
};

/**
 * Get connected devices for a protocol
 */
function getConnectedDevices(protocol) {
  return connectedDevices[protocol] || new Map();
}

/**
 * Register a device connection
 */
function registerDevice(protocol, imei, info) {
  connectedDevices[protocol].set(imei, {
    ...info,
    connectedAt: new Date(),
    lastActivity: new Date(),
  });
}

/**
 * Unregister a device connection
 */
function unregisterDevice(protocol, imei) {
  connectedDevices[protocol].delete(imei);
}

/**
 * Update device last activity
 */
function updateDeviceActivity(protocol, imei) {
  const device = connectedDevices[protocol].get(imei);
  if (device) {
    device.lastActivity = new Date();
  }
}

/**
 * Find and validate device by IMEI
 */
async function findDeviceByImei(imei) {
  try {
    return await Device.findByImei(imei);
  } catch (err) {
    console.error('Device lookup error:', err.message);
    return null;
  }
}

/**
 * Find vehicle by device ID
 */
async function findVehicleByDevice(deviceId) {
  try {
    return await Vehicle.findByDeviceId(deviceId);
  } catch (err) {
    console.error('Vehicle lookup error:', err.message);
    return null;
  }
}

/**
 * Create location record and update vehicle
 */
async function saveLocation(parsed, protocol) {
  try {
    const { emitLocationUpdate } = require('../../config/socket');
    const { getIO } = require('../../config/socket');
    const { processLocation } = require('../../services/alert.service');

    const deviceInfo = connectedDevices[protocol]?.get(parsed.imei);
    
    // Try to find device if not in session
    let device = deviceInfo?.device;
    if (!device) {
      device = await findDeviceByImei(parsed.imei);
    }

    if (!device) {
      console.log(`[${protocol}] Unknown device: ${parsed.imei}`);
      return null;
    }

    let vehicle = deviceInfo?.vehicle;
    if (!vehicle) {
      vehicle = await findVehicleByDevice(device.id);
    }

    if (!vehicle) {
      console.log(`[${protocol}] No vehicle for device: ${device.device_name}`);
      return null;
    }

    // Create location record
    const locationData = {
      device_id: device.id,
      vehicle_id: vehicle.id,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      speed: parsed.speed || 0,
      heading: parsed.heading || 0,
      altitude: parsed.altitude || 0,
      odometer: parsed.odometer || 0,
      ignition: parsed.ignition || false,
      main_power: parsed.mainPower !== undefined ? parsed.mainPower : true,
      main_voltage: parsed.mainVoltage || 0,
      battery_voltage: parsed.batteryVoltage || 0,
      satellites: parsed.satellites || 0,
      gsm_strength: parsed.gsmStrength || 0,
      digital_inputs: parsed.digitalInputs || '',
      digital_outputs: parsed.digitalOutputs || '',
      analog_input1: parsed.analogInput1 || 0,
      analog_input2: parsed.analogInput2 || 0,
      gps_valid: parsed.gpsValid !== undefined ? parsed.gpsValid : true,
      gps_time: parsed.gpsTime || new Date(),
      server_time: new Date(),
      raw_data: parsed.rawData || null,
      frame_number: parsed.frameNumber || '',
    };

    const location = await Location.create(locationData);

    // Update vehicle status
    const status = getVehicleStatus(parsed);
    await Vehicle.update(vehicle.id, {
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      speed: parsed.speed || 0,
      heading: parsed.heading || 0,
      status,
      last_location_update: new Date(),
      last_seen: new Date(),
    });

    // Emit to socket
    emitLocationUpdate(vehicle.id, {
      ...location,
      organization_id: vehicle.organization_id,
      status,
    });

    // Process alerts
    const io = getIO();
    if (io) {
      await processLocation(location, io);
    }

    return { location, vehicle };
  } catch (err) {
    console.error(`[${protocol}] Location save error:`, err.message);
    return null;
  }
}

/**
 * Create and emit alert
 */
async function saveAlert(parsed, protocol, alertType, severity = 'warning') {
  try {
    const { emitAlert } = require('../../config/socket');
    const deviceInfo = connectedDevices[protocol]?.get(parsed.imei);

    const alertData = {
      device_id: deviceInfo?.device?.id || null,
      vehicle_id: deviceInfo?.vehicle?.id || null,
      alert_type: alertType,
      alert_id: parsed.alertId || '',
      severity,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      speed: parsed.speed || 0,
      heading: parsed.heading || 0,
      ignition: parsed.ignition || false,
      main_power: parsed.mainPower !== undefined ? parsed.mainPower : true,
      battery_voltage: parsed.batteryVoltage || 0,
      gps_time: parsed.gpsTime || new Date(),
      server_time: new Date(),
      raw_data: parsed.rawData || null,
    };

    const alert = await Alert.create(alertData);

    // Emit alert
    if (deviceInfo?.vehicle) {
      emitAlert(deviceInfo.vehicle.id, {
        ...alert,
        alert_name: alertType,
      });
    }

    return alert;
  } catch (err) {
    console.error(`[${protocol}] Alert save error:`, err.message);
    return null;
  }
}

/**
 * Determine vehicle status based on parsed data
 */
function getVehicleStatus(parsed) {
  const ignition = parsed.ignition;
  const speed = parsed.speed || 0;

  if (ignition) {
    return speed > 5 ? 'moving' : 'idle';
  }
  return 'stopped';
}

/**
 * Get all connected devices summary
 */
function getConnectionSummary() {
  return {
    ais140: connectedDevices.ais140.size,
    bstp15: connectedDevices.bstp15.size,
    bstpl17: connectedDevices.bstpl17.size,
    total: connectedDevices.ais140.size + connectedDevices.bstp15.size + connectedDevices.bstpl17.size,
  };
}

module.exports = {
  getConnectedDevices,
  registerDevice,
  unregisterDevice,
  updateDeviceActivity,
  findDeviceByImei,
  findVehicleByDevice,
  saveLocation,
  saveAlert,
  getVehicleStatus,
  getConnectionSummary,
};