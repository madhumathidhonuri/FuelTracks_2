/**
 * BSTPL-17 Protocol Parser (BS Technotronics)
 * Port: 9003
 * 
 * Note: BSTPL-17 uses the same packet format as BSTP-15
 * - Header: $10 (normal), $11 (alert)
 * - Footer: #
 * - Separator: comma (,)
 * 
 * This parser handles BSTPL-17 specific variations if any.
 */

const PROTOCOL = 'bstpl17';

// Alert message patterns (same as BSTP-15)
const ALERT_PATTERNS = {
  'IGNITION ON': { alertId: 'IN', alertName: 'Ignition On', severity: 'info' },
  'IGNITION OFF': { alertId: 'IF', alertName: 'Ignition Off', severity: 'info' },
  'MAIN BATTERY CONNECTED': { alertId: 'BR', alertName: 'Battery Reconnected', severity: 'info' },
  'MAIN BATTERY DISCONNECTED': { alertId: 'BD', alertName: 'Battery Disconnected', severity: 'critical' },
  'BATTERY LOW': { alertId: 'BL', alertName: 'Battery Low', severity: 'warning' },
  'VTS BOX CLOSE': { alertId: 'TC', alertName: 'Box Closed', severity: 'info' },
  'VTS BOX OPEN': { alertId: 'TA', alertName: 'Tamper Alert', severity: 'critical' },
};

/**
 * Parse any BSTPL-17 packet
 */
function parse(data) {
  const trimmed = data.trim();
  
  // Normal data packet
  if (trimmed.startsWith('$10')) {
    return parseNormalPacket(trimmed);
  }
  
  // Alert packet
  if (trimmed.startsWith('$11')) {
    return parseAlertPacket(trimmed);
  }
  
  return null;
}

/**
 * Parse Normal Data Packet
 */
function parseNormalPacket(data) {
  const cleanData = data.replace('$10,', '').replace('#', '');
  const parts = cleanData.split(',');
  
  if (parts.length < 23) {
    return null;
  }

  const vehicleId = parts[0];
  const latitudeRaw = parseFloat(parts[5]) || 0;
  const latDir = parts[6] || 'N';
  const longitudeRaw = parseFloat(parts[7]) || 0;
  const lonDir = parts[8] || 'E';
  const dateStr = parts[3] || '';
  const timeStr = parts[4] || '';
  const din1 = parts[15] === '1';
  const din2 = parts[16] === '1';
  const din3 = parts[17] === '1';
  const engine = parts[18] === '1';

  return {
    protocol: PROTOCOL,
    type: 'LOCATION',
    vehicleId,
    gpsValid: parts[2] === 'A',
    date: dateStr,
    time: timeStr,
    gpsTime: parseBSTPL17DateTime(dateStr, timeStr),
    latitude: convertToDecimal(latitudeRaw, latDir),
    latitudeDirection: latDir,
    longitude: convertToDecimal(longitudeRaw, lonDir),
    longitudeDirection: lonDir,
    speed: parseFloat(parts[9]) || 0,
    odometer: parseFloat(parts[10]) || 0,
    heading: parseFloat(parts[11]) || 0,
    satellites: parseInt(parts[12]) || 0,
    gsmStrength: parseInt(parts[13]) || 0,
    mainBattery: parts[14] === '1',
    ignition: din1,
    digitalInputs: `${din3 ? '1' : '0'}${din2 ? '1' : '0'}${din1 ? '1' : '0'}0`,
    engineStatus: engine,
    analogInput1: parseFloat(parts[19]) || 0,
    fuelLevel: parseFloat(parts[20]) || 0,
    mainVoltage: parseFloat(parts[21]) || 0,
    packetStatus: parts[22] === 'L' ? 'Live' : 'History',
    rawData: data,
  };
}

/**
 * Parse Alert Packet
 */
function parseAlertPacket(data) {
  const withoutHeader = data.replace('$11,', '');
  const parts = withoutHeader.split(',');
  
  if (parts.length < 9) {
    return null;
  }

  const vehicleId = parts[0];
  const dateStr = parts[2] || '';
  const timeStr = parts[3] || '';
  const latitudeRaw = parseFloat(parts[4]) || 0;
  const latDir = parts[5] || 'N';
  const longitudeRaw = parseFloat(parts[6]) || 0;
  const lonDir = parts[7] || 'E';
  const alertMessage = parts[8]?.replace('#', '').trim() || '';

  let alertInfo = { alertId: 'UK', alertName: alertMessage, severity: 'warning' };
  for (const [pattern, info] of Object.entries(ALERT_PATTERNS)) {
    if (alertMessage.toUpperCase().includes(pattern)) {
      alertInfo = info;
      break;
    }
  }

  return {
    protocol: PROTOCOL,
    type: 'ALERT',
    vehicleId,
    date: dateStr,
    time: timeStr,
    gpsTime: parseBSTPL17DateTime(dateStr, timeStr),
    latitude: convertToDecimal(latitudeRaw, latDir),
    latitudeDirection: latDir,
    longitude: convertToDecimal(longitudeRaw, lonDir),
    longitudeDirection: lonDir,
    alertId: alertInfo.alertId,
    alertName: alertInfo.alertName,
    alertMessage,
    severity: alertInfo.severity,
    rawData: data,
  };
}

// ============================================
// Utility Functions
// ============================================

function convertToDecimal(value, direction) {
  if (!value || isNaN(value)) return 0;
  const degrees = Math.floor(value / 100);
  const minutes = value - (degrees * 100);
  let decimal = degrees + (minutes / 60);
  if (direction === 'S' || direction === 'W') {
    decimal = -decimal;
  }
  return parseFloat(decimal.toFixed(6));
}

function parseBSTPL17DateTime(dateStr, timeStr) {
  try {
    if (dateStr.length === 6) {
      const day = parseInt(dateStr.substring(0, 2));
      const month = parseInt(dateStr.substring(2, 4)) - 1;
      const year = 2000 + parseInt(dateStr.substring(4, 6));
      
      if (timeStr.length === 6) {
        const hour = parseInt(timeStr.substring(0, 2));
        const minute = parseInt(timeStr.substring(2, 4));
        const second = parseInt(timeStr.substring(4, 6));
        return new Date(year, month, day, hour, minute, second);
      }
      return new Date(year, month, day);
    }
    return new Date();
  } catch (e) {
    return new Date();
  }
}

function getImeiFromVehicleId(vehicleId) {
  if (/^\d{15}$/.test(vehicleId)) {
    return vehicleId;
  }
  return null;
}

module.exports = {
  parse,
  ALERT_PATTERNS,
  PROTOCOL,
  getImeiFromVehicleId,
};