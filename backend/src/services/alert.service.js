const Alert = require('../models/Alert');
const Vehicle = require('../models/Vehicle');
const Organization = require('../models/Organization');
const emailService = require('./email.service');
const smsService = require('./sms.service');

const processLocation = async (locationData, io) => {
  try {
    const vehicle = await Vehicle.findById(locationData.vehicle_id);
    if (!vehicle) return;

    const org = await Organization.findById(vehicle.organization_id);
    if (!org) return;

    const alerts = [];

    // Overspeed alert
    if (org.overspeed_alert && locationData.speed > (org.overspeed_limit || 80)) {
      const alert = await createAlert({
        vehicle_id: vehicle.id,
        organization_id: org.id,
        alert_type: 'overspeed',
        severity: 'high',
        message: `Vehicle ${vehicle.vehicle_name} exceeded speed limit (${locationData.speed} km/h > ${org.overspeed_limit} km/h)`,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        speed: locationData.speed,
      });
      if (alert) alerts.push(alert);
    }

    // Idle alert (ignition on, speed 0, for configured duration)
    if (org.idle_alert && locationData.ignition && locationData.speed === 0) {
      const lastLocation = await require('../models/Location').findLatestByVehicle(vehicle.id);
      if (lastLocation) {
        const idleMinutes = (new Date(locationData.server_time) - new Date(lastLocation.server_time)) / 60000;
        if (idleMinutes >= (org.idle_duration || 10)) {
          const alert = await createAlert({
            vehicle_id: vehicle.id,
            organization_id: org.id,
            alert_type: 'idle',
            severity: 'medium',
            message: `Vehicle ${vehicle.vehicle_name} has been idle for ${Math.round(idleMinutes)} minutes`,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            speed: 0,
          });
          if (alert) alerts.push(alert);
        }
      }
    }

    // Parking alert (ignition off for configured duration)
    if (org.parking_alert && !locationData.ignition) {
      const lastLocation = await require('../models/Location').findLatestByVehicle(vehicle.id);
      if (lastLocation && lastLocation.ignition) {
        const parkingMinutes = (new Date(locationData.server_time) - new Date(lastLocation.server_time)) / 60000;
        if (parkingMinutes >= (org.parking_duration || 10)) {
          const alert = await createAlert({
            vehicle_id: vehicle.id,
            organization_id: org.id,
            alert_type: 'parking',
            severity: 'low',
            message: `Vehicle ${vehicle.vehicle_name} has been parked for ${Math.round(parkingMinutes)} minutes`,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            speed: 0,
          });
          if (alert) alerts.push(alert);
        }
      }
    }

    // Emit each alert via Socket.io and send notifications
    for (const alert of alerts) {
      if (io) {
        io.to(`org_${org.id}`).emit('alert:new', {
          alertId: alert.id,
          vehicleId: vehicle.id,
          vehicleName: vehicle.vehicle_name,
          type: alert.alert_type,
          severity: alert.severity,
          message: alert.message,
          time: alert.created_at,
          lat: alert.latitude,
          lng: alert.longitude,
        });
      }

      // Send email if org has email
      if (org.email) {
        const emailResult = await emailService.sendAlertEmail(alert, vehicle, org);
        if (emailResult.success) {
          await Alert.markRead(alert.id);
          await require('../config/db').query('UPDATE alerts SET email_sent = true WHERE id = $1', [alert.id]);
        }
      }

      // Send SMS if org has mobile
      if (org.mobile) {
        const smsResult = await smsService.sendAlertSMS(org.mobile, alert, vehicle);
        if (smsResult.success) {
          await require('../config/db').query('UPDATE alerts SET sms_sent = true WHERE id = $1', [alert.id]);
        }
      }
    }

    return alerts;
  } catch (err) {
    console.error('Alert processing error:', err.message);
    return [];
  }
};

const createAlert = async (data) => {
  try {
    const alert = await Alert.create(data);
    return alert;
  } catch (err) {
    console.error('Alert creation error:', err.message);
    return null;
  }
};

const createCustomAlert = async (data, io) => {
  const alert = await createAlert(data);
  if (alert && io) {
    const vehicle = await Vehicle.findById(data.vehicle_id);
    io.to(`org_${data.organization_id}`).emit('alert:new', {
      alertId: alert.id,
      vehicleId: data.vehicle_id,
      vehicleName: vehicle?.vehicle_name || 'Unknown',
      type: alert.alert_type,
      severity: alert.severity,
      message: alert.message,
      time: alert.created_at,
    });
  }
  return alert;
};

module.exports = { processLocation, createAlert, createCustomAlert };