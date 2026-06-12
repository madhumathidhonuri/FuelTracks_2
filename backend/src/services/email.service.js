const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: false,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (!env.smtp.user || !to) return { success: false, message: 'Missing required fields' };

  try {
    const info = await getTransporter().sendMail({
      from: env.smtp.from,
      to,
      subject,
      html,
      text,
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Email send error:', err.message);
    return { success: false, message: err.message };
  }
};

const sendWelcomeEmail = async (user, tempPassword) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: 'Inter', Arial, sans-serif; background: #f0f8ff; margin: 0; padding: 20px; }
      .container { max-width: 520px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden;
                   box-shadow: 0 20px 60px rgba(2,120,201,0.1); border: 1px solid rgba(56,175,249,0.22); }
      .header { background: linear-gradient(135deg, rgba(56,175,249,0.12), rgba(2,120,201,0.08));
                padding: 28px 32px; border-bottom: 1px solid rgba(56,175,249,0.18); }
      .logo-text { font-size: 22px; font-weight: 700; color: #075186; display: flex; align-items: center; gap: 10px; }
      .icon-box { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg,rgba(56,175,249,0.2),rgba(2,120,201,0.12));
                  border: 1px solid rgba(56,175,249,0.35); display: flex; align-items: center; justify-content: center; font-size: 16px; }
      .body { padding: 28px 32px; }
      h1 { font-size: 22px; color: #0c446f; margin: 0 0 16px; }
      p { color: #075186; font-size: 14px; line-height: 1.6; margin: 0 0 16px; }
      .credentials { background: linear-gradient(135deg, rgba(218,241,255,0.5), rgba(186,226,253,0.4));
                     border: 1px solid rgba(56,175,249,0.28); border-radius: 12px; padding: 20px; margin: 20px 0; }
      .cred-row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
      .cred-label { color: #0360a3; font-weight: 500; }
      .cred-value { color: #075186; font-weight: 700; font-family: 'Space Grotesk', monospace; }
      .btn { display: inline-block; background: linear-gradient(135deg, rgba(14,150,235,0.18), rgba(2,120,201,0.14));
             border: 1px solid rgba(56,175,249,0.45); border-radius: 14px; color: #075186; padding: 14px 28px;
             font-size: 15px; font-weight: 600; text-decoration: none; margin: 16px 0; }
      .footer { padding: 16px 32px; background: rgba(218,241,255,0.3); font-size: 12px; color: #64748b; text-align: center; }
      .warning { background: rgba(251,191,36,0.12); border: 1px solid rgba(251,191,36,0.3); border-radius: 10px; padding: 12px 16px;
                 font-size: 12px; color: #92650a; margin: 16px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo-text">
          <div class="icon-box">⛽</div>
          FuelTracks
        </div>
      </div>
      <div class="body">
        <h1>🚛 Your FuelTracks Account is Ready!</h1>
        <p>Welcome, <strong>${user.username}</strong>! Your account has been created successfully. Here are your login credentials:</p>
        <div class="credentials">
          <div class="cred-row"><span class="cred-label">Username:</span><span class="cred-value">${user.username}</span></div>
          <div class="cred-row"><span class="cred-label">Email:</span><span class="cred-value">${user.email}</span></div>
          <div class="cred-row"><span class="cred-label">Password:</span><span class="cred-value">${tempPassword}</span></div>
        </div>
        <div class="warning">⚠️ Please change your password after logging in.</div>
        <a href="${env.frontendUrl}/login" class="btn">Login to FuelTracks →</a>
        <p>If you didn't request this account, please contact support immediately.</p>
      </div>
      <div class="footer">© ${new Date().getFullYear()} FuelTracks — Smart Fleet Management · support@fueltracks.in</div>
    </div>
  </body>
  </html>`;

  return sendEmail({ to: user.email, subject: 'Welcome to FuelTracks 🚛', html });
};

const sendAlertEmail = async (alert, vehicle, org) => {
  const severityColors = { low: '#0a8f78', medium: '#92650a', high: '#b91c1c' };
  const severityBg = { low: 'rgba(52,216,181,0.12)', medium: 'rgba(251,191,36,0.12)', high: 'rgba(248,113,113,0.12)' };
  const color = severityColors[alert.severity] || '#075186';
  const bg = severityBg[alert.severity] || 'rgba(56,175,249,0.12)';

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: 'Inter', Arial, sans-serif; background: #f0f8ff; margin: 0; padding: 20px; }
      .container { max-width: 520px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden;
                   box-shadow: 0 20px 60px rgba(2,120,201,0.1); border: 1px solid rgba(56,175,249,0.22); }
      .header { background: linear-gradient(135deg, rgba(248,113,113,0.1), rgba(251,191,36,0.08)); padding: 20px 32px; border-bottom: 1px solid rgba(56,175,249,0.18); }
      .logo-text { font-size: 20px; font-weight: 700; color: #075186; display: flex; align-items: center; gap: 10px; }
      .icon-box { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg,rgba(56,175,249,0.2),rgba(2,120,201,0.12));
                  border: 1px solid rgba(56,175,249,0.35); display: flex; align-items: center; justify-content: center; font-size: 14px; }
      .body { padding: 24px 32px; }
      .alert-badge { display: inline-block; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700;
                     text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
      h1 { font-size: 20px; color: #0c446f; margin: 0 0 16px; }
      p { color: #075186; font-size: 14px; line-height: 1.6; margin: 0 0 12px; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
      .info-item { background: linear-gradient(135deg, rgba(218,241,255,0.5), rgba(186,226,253,0.4));
                   border: 1px solid rgba(56,175,249,0.22); border-radius: 10px; padding: 14px; }
      .info-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #0360a3; font-weight: 600; }
      .info-value { font-size: 14px; color: #075186; font-weight: 700; margin-top: 4px; }
      .footer { padding: 16px 32px; background: rgba(218,241,255,0.3); font-size: 12px; color: #64748b; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo-text">
          <div class="icon-box">⛽</div>
          FuelTracks
        </div>
      </div>
      <div class="body">
        <div class="alert-badge" style="background:${bg};color:${color};">⚠️ ${alert.alert_type?.toUpperCase()} Alert — ${alert.severity?.toUpperCase()}</div>
        <h1>Fleet Alert: ${vehicle?.vehicle_name || 'Unknown Vehicle'}</h1>
        <p>${alert.message}</p>
        <div class="info-grid">
          <div class="info-item"><div class="info-label">Vehicle</div><div class="info-value">${vehicle?.vehicle_name || 'N/A'}</div></div>
          <div class="info-item"><div class="info-label">Time</div><div class="info-value">${new Date(alert.created_at).toLocaleString('en-IN')}</div></div>
          <div class="info-item"><div class="info-label">Location</div><div class="info-value">${alert.latitude && alert.longitude ? `${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}` : 'N/A'}</div></div>
          ${alert.speed ? `<div class="info-item"><div class="info-label">Speed</div><div class="info-value">${alert.speed} km/h</div></div>` : ''}
        </div>
        ${alert.latitude && alert.longitude ? `<p><a href="https://www.google.com/maps?q=${alert.latitude},${alert.longitude}" style="color:#0278c9;">📍 View on Google Maps</a></p>` : ''}
      </div>
      <div class="footer">© ${new Date().getFullYear()} FuelTracks Fleet Management</div>
    </div>
  </body>
  </html>`;

  return sendEmail({ to: org?.email, subject: `⚠️ FuelTracks Alert: ${alert.alert_type} - ${vehicle?.vehicle_name}`, html });
};

const sendDailySummaryEmail = async (org, data) => {
  const html = `
  <!DOCTYPE html>
  <html><head><meta charset="UTF-8">
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background: #f0f8ff; margin: 0; padding: 20px; }
    .container { max-width: 560px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(2,120,201,0.1); }
    .header { background: linear-gradient(135deg, rgba(56,175,249,0.12), rgba(2,120,201,0.08)); padding: 24px 32px; }
    .body { padding: 24px 32px; }
    .stat-row { display: flex; gap: 12px; margin: 16px 0; }
    .stat-card { flex: 1; background: linear-gradient(135deg, rgba(218,241,255,0.5), rgba(186,226,253,0.4));
                 border: 1px solid rgba(56,175,249,0.22); border-radius: 12px; padding: 16px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: 700; color: #075186; }
    .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #0360a3; margin-top: 4px; }
    p { color: #075186; font-size: 14px; line-height: 1.6; margin: 0 0 12px; }
    .footer { padding: 16px 32px; background: rgba(218,241,255,0.3); font-size: 12px; color: #64748b; text-align: center; }
  </style></head>
  <body>
    <div class="container">
      <div class="header"><h1 style="margin:0;font-size:20px;color:#0c446f;">📊 FuelTracks Daily Summary — ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h1></div>
      <div class="body">
        <p>Hello <strong>${org?.name}</strong>,</p>
        <p>Here's your fleet performance summary for today.</p>
        <div class="stat-row">
          <div class="stat-card"><div class="stat-value">${data.totalVehicles || 0}</div><div class="stat-label">Total Vehicles</div></div>
          <div class="stat-card"><div class="stat-value">${data.runningToday || 0}</div><div class="stat-label">Running Today</div></div>
          <div class="stat-card"><div class="stat-value">${data.totalDistance || 0} km</div><div class="stat-label">Distance Covered</div></div>
        </div>
        <div class="stat-row">
          <div class="stat-card"><div class="stat-value">${data.alertsToday || 0}</div><div class="stat-label">Alerts Today</div></div>
          <div class="stat-card"><div class="stat-value">${data.tripsToday || 0}</div><div class="stat-label">Trips Completed</div></div>
          <div class="stat-card"><div class="stat-value">${data.idleEvents || 0}</div><div class="stat-label">Idle Events</div></div>
        </div>
        <p>Login to FuelTracks to view detailed reports and analytics.</p>
      </div>
      <div class="footer">© ${new Date().getFullYear()} FuelTracks</div>
    </div>
  </body>
  </html>`;

  return sendEmail({ to: org?.email, subject: `📊 FuelTracks Daily Summary - ${new Date().toLocaleDateString('en-IN')}`, html });
};

const sendLicenceExpiryEmail = async (org, daysLeft) => {
  const html = `
  <!DOCTYPE html>
  <html><head><meta charset="UTF-8">
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background: #f0f8ff; margin: 0; padding: 20px; }
    .container { max-width: 520px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(2,120,201,0.1); }
    .header { background: linear-gradient(135deg, rgba(251,191,36,0.1), rgba(248,113,113,0.08)); padding: 24px 32px; }
    .body { padding: 24px 32px; }
    h1 { font-size: 20px; color: #0c446f; margin: 0 0 12px; }
    p { color: #075186; font-size: 14px; line-height: 1.6; margin: 0 0 12px; }
    .warning-box { background: rgba(251,191,36,0.12); border: 1px solid rgba(251,191,36,0.3); border-radius: 12px; padding: 20px; margin: 16px 0;
                   text-align: center; }
    .warning-num { font-size: 36px; font-weight: 700; color: #92650a; }
    .footer { padding: 16px 32px; background: rgba(218,241,255,0.3); font-size: 12px; color: #64748b; text-align: center; }
  </style></head>
  <body>
    <div class="container">
      <div class="header"><h1>⚠️ FuelTracks Licence Expiring Soon</h1></div>
      <div class="body">
        <p>Hello <strong>${org?.name}</strong>,</p>
        <p>Your FuelTracks licence is expiring in <strong>${daysLeft} days</strong>. Please renew it to continue using all features.</p>
        <div class="warning-box">
          <div class="warning-num">${daysLeft} days</div>
          <div>until licence expiry</div>
        </div>
        <p>Contact our support team to renew your licence and maintain uninterrupted service.</p>
        <p style="font-size:12px;color:#64748b;">Support: support@fueltracks.in</p>
      </div>
      <div class="footer">© ${new Date().getFullYear()} FuelTracks</div>
    </div>
  </body>
  </html>`;

  return sendEmail({ to: org?.email, subject: `FuelTracks: Licence expiring in ${daysLeft} days`, html });
};

module.exports = { sendEmail, sendWelcomeEmail, sendAlertEmail, sendDailySummaryEmail, sendLicenceExpiryEmail };