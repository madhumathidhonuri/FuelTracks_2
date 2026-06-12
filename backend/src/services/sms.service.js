const twilio = require('twilio');
const env = require('../config/env');

let client = null;

const getClient = () => {
  if (!client && env.twilio.accountSid && env.twilio.authToken) {
    client = twilio(env.twilio.accountSid, env.twilio.authToken);
  }
  return client;
};

const sendSMS = async ({ to, body }) => {
  if (!env.twilio.accountSid || !env.twilio.authToken) {
    console.warn('Twilio not configured, SMS not sent');
    return { success: false, message: 'Twilio not configured' };
  }

  if (!to || !body) {
    return { success: false, message: 'Missing required fields' };
  }

  try {
    const twilioClient = getClient();
    if (!twilioClient) return { success: false, message: 'Twilio client not initialized' };

    const message = await twilioClient.messages.create({
      body,
      from: env.twilio.from,
      to,
    });

    return { success: true, sid: message.sid, status: message.status };
  } catch (err) {
    console.error('SMS send error:', err.message);
    return { success: false, message: err.message };
  }
};

const sendWelcomeSMS = async (mobile, username, tempPassword) => {
  const body = `Welcome to FuelTracks! 🚛\n\nUsername: ${username}\nPassword: ${tempPassword}\n\nLogin: ${env.frontendUrl}/login\n\nPlease change your password after login.`;
  return sendSMS({ to: mobile, body });
};

const sendAlertSMS = async (mobile, alert, vehicle) => {
  const body = `FuelTracks Alert 🚨\n\nVehicle: ${vehicle?.vehicle_name || 'Unknown'}\nType: ${alert.alert_type}\nTime: ${new Date(alert.created_at).toLocaleString('en-IN')}\n${alert.speed ? `Speed: ${alert.speed} km/h\n` : ''}Location: ${alert.latitude && alert.longitude ? `${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}` : 'N/A'}\n\n- FuelTracks`;
  return sendSMS({ to: mobile, body });
};

const sendOTP = async (mobile, otp) => {
  const body = `Your FuelTracks OTP is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`;
  return sendSMS({ to: mobile, body });
};

module.exports = { sendSMS, sendWelcomeSMS, sendAlertSMS, sendOTP };