/**
 * AIS-140 Protocol Parser (tnavic)
 * Port: 9001
 * 
 * Packet Headers:
 * - $LGN: Login Packet
 * - $HLM: Health Monitoring Packet
 * - $NRM: Location/Periodic Information Packet
 * - $ALT: Alert Information Packet
 * - $EPB: Emergency Packet
 * - HCHKR/ACTVR: Health Check/Activation Response
 */

const PROTOCOL = 'ais140';

/**
 * Parse any AIS-140 packet
 */
function parse(data) {
  const trimmed = data.trim();
  
  if (trimmed.startsWith('$LGN')) return parseLogin(trimmed);
  if (trimmed.startsWith('$HLM')) return parseHealth(trimmed);
  if (trimmed.startsWith('$NRM')) return parseLocation(trimmed);
  if (trimmed.startsWith('$ALT')) return parseAlert(trimmed);
  if (trimmed.startsWith('$EPB')) return parseEmergency(trimmed);
  if (trimmed.startsWith('ACTVR') || trimmed.startsWith('HCHKR')) return parseActivationResponse(trimmed);
  
  return null;
}

/**
 * Parse Login Packet
 * Format: $LGN,<device_name>,<imei>,<sw_version>,<lat>,<lat_dir>,<lon>,<lon_dir>*<checksum>
 */
function parseLogin(data) {
  const cleanData = data.replace(/\*[A-F0-9]{8}$/, '').replace('*', '');
  const parts = cleanData.split(',');
  
  if (parts[0] !== '$LGN' || parts.length < 8) return null;

  return {
    protocol: PROTOCOL,
    type: 'LOGIN',
    deviceName: parts[1] || '',
    imei: parts[2] || '',
    softwareVersion: parts[3] || '',
    latitude: parseFloat(parts[4]) || 0,
    latitudeDirection: parts[5] || 'N',
    longitude: parseFloat(parts[6]) || 0,
    longitudeDirection: parts[7] || 'E',
    rawData: data,
  };
}

/**
 * Parse Health Monitoring Packet
 * Format: $HLM,<vendor_id>,<sw_version>,<imei>,<battery>,<low_bat>,<memory>,<update_ign_on>,<update_ign_off>,<din>,<ain>*
 */
function parseHealth(data) {
  const cleanData = data.replace(/\*[A-F0-9]{8}$/, '').replace('*', '');
  const parts = cleanData.split(',');
  
  if (parts[0] !== '$HLM' || parts.length < 11) return null;

  return {
    protocol: PROTOCOL,
    type: 'HEALTH',
    vendorId: parts[1] || '',
    softwareVersion: parts[2] || '',
    imei: parts[3] || '',
    batteryPercentage: parseInt(parts[4]) || 0,
    lowBatteryThreshold: parseInt(parts[5]) || 20,
    memoryPercentage: parseInt(parts[6]) || 0,
    updateRateIgnitionOn: parseInt(parts[7]) || 60,
    updateRateIgnitionOff: parseInt(parts[8]) || 60,
    digitalInputs: parts[9] || '0000',
    analogInputs: parts[10] || '00',
    rawData: data,
  };
}

/**
 * Parse Location/Periodic Packet
 * Full AIS-140 format with 46+ fields
 */
function parseLocation(data) {
  const cleanData = data.replace(/\*[A-F0-9]{8}$/, '').replace('*', '');
  const parts = cleanData.split(',');
  
  if (parts[0] !== '$NRM' || parts.length < 46) return null;

  const latitude = parseFloat(parts[12]) || 0;
  const latDir = parts[13] || 'N';
  const longitude = parseFloat(parts[14]) || 0;
  const lonDir = parts[15] || 'E';

  return {
    protocol: PROTOCOL,
    type: 'LOCATION',
    vendorId: parts[1] || '',
    softwareVersion: parts[2] || '',
    packetType: parts[3] || 'NR',
    alertId: parts[4] || '',
    packetStatus: parts[5] || 'L',
    imei: parts[6] || '',
    vehicleReg: parts[7] || '',
    gpsFix: parts[8] === '1',
    date: parts[10] || '',
    time: parts[11] || '',
    gpsTime: parseGPSDateTime(parts[10], parts[11]),
    latitude: convertDMSToDecimal(latitude, latDir),
    latitudeDirection: latDir,
    longitude: convertDMSToDecimal(longitude, lonDir),
    longitudeDirection: lonDir,
    speed: parseFloat(parts[16]) || 0,
    heading: parseFloat(parts[17]) || 0,
    satellites: parseInt(parts[18]) || 0,
    altitude: parseFloat(parts[19]) || 0,
    pdop: parseFloat(parts[20]) || 0,
    hdop: parseFloat(parts[21]) || 0,
    operator: parts[22] || '',
    ignition: parts[23] === '1',
    mainPower: parts[24] === '1',
    mainVoltage: parseFloat(parts[25]) || 0,
    batteryVoltage: parseFloat(parts[26]) || 0,
    emergency: parts[27] === '1',
    tempAlert: parts[28] === 'O' ? 'OPEN' : 'CLOSED',
    gsmStrength: parseInt(parts[29]) || 0,
    mcc: parts[30] || '',
    mnc: parts[31] || '',
    lac: parts[32] || '',
    cellId: parts[33] || '',
    digitalInputs: parts[35] || '0000',
    digitalOutputs: parts[36] || '00',
    analogInput1: parseInt(parts[37]) || 0,
    analogInput2: parseInt(parts[38]) || 0,
    frameNumber: parts[39] || '',
    odometer: parseFloat(parts[40]) || 0,
    misc1: parts[40] || '-',
    misc2: parts[41] || '-',
    misc3: parts[42] || '-',
    misc4: parts[43] || '-',
    fuelData: parseFuelData(parts[42]),
    tempData: parseTemperatureData(parts[43]),
    rawData: data,
  };
}

/**
 * Parse Alert Packet
 * Similar to location but with alert-specific fields
 */
function parseAlert(data) {
  const cleanData = data.replace(/\*[A-F0-9]{8}$/, '').replace('*', '');
  const parts = cleanData.split(',');
  
  if (parts[0] !== '$ALT' || parts.length < 46) return null;

  // Check for OTA ACK
  if (parts[3] === 'OA') return parseOTAACK(parts, data);

  const latitude = parseFloat(parts[12]) || 0;
  const latDir = parts[13] || 'N';
  const longitude = parseFloat(parts[14]) || 0;
  const lonDir = parts[15] || 'E';

  return {
    protocol: PROTOCOL,
    type: 'ALERT',
    vendorId: parts[1] || '',
    softwareVersion: parts[2] || '',
    packetType: parts[3] || 'OS',
    alertId: parts[4] || '',
    packetStatus: parts[5] || 'L',
    imei: parts[6] || '',
    vehicleReg: parts[7] || '',
    gpsFix: parts[8] === '1',
    date: parts[10] || '',
    time: parts[11] || '',
    gpsTime: parseGPSDateTime(parts[10], parts[11]),
    latitude: convertDMSToDecimal(latitude, latDir),
    latitudeDirection: latDir,
    longitude: convertDMSToDecimal(longitude, lonDir),
    longitudeDirection: lonDir,
    speed: parseFloat(parts[16]) || 0,
    heading: parseFloat(parts[17]) || 0,
    satellites: parseInt(parts[18]) || 0,
    altitude: parseFloat(parts[19]) || 0,
    ignition: parts[23] === '1',
    mainPower: parts[24] === '1',
    mainVoltage: parseFloat(parts[25]) || 0,
    batteryVoltage: parseFloat(parts[26]) || 0,
    emergency: parts[27] === '1',
    tempAlert: parts[28] === 'O' ? 'OPEN' : 'CLOSED',
    gsmStrength: parseInt(parts[29]) || 0,
    digitalInputs: parts[35] || '0000',
    digitalOutputs: parts[36] || '00',
    frameNumber: parts[39] || '',
    odometer: parseFloat(parts[40]) || 0,
    rawData: data,
  };
}

/**
 * Parse OTA Acknowledgement
 */
function parseOTAACK(parts, data) {
  const otaInfo = parts[42] || '';
  const [typeSrc, cmdVal] = otaInfo.split('|');
  const [type, src, srcVal] = typeSrc.split(':');
  const [cmd, val] = cmdVal ? cmdVal.split(':') : ['', ''];

  return {
    protocol: PROTOCOL,
    type: 'OTA_ACK',
    vendorId: parts[1] || '',
    softwareVersion: parts[2] || '',
    alertId: parts[4] || '',
    imei: parts[6] || '',
    latitude: convertDMSToDecimal(parseFloat(parts[11]) || 0, parts[12] || 'N'),
    longitude: convertDMSToDecimal(parseFloat(parts[13]) || 0, parts[14] || 'E'),
    speed: parseFloat(parts[16]) || 0,
    heading: parseFloat(parts[17]) || 0,
    ignition: parts[23] === '1',
    mainPower: parts[24] === '1',
    batteryVoltage: parseFloat(parts[26]) || 0,
    otaType: type,
    otaSource: src,
    otaCommand: cmd,
    otaValue: val,
    rawData: data,
  };
}

/**
 * Parse Emergency Packet
 * Format: $EPB,<type>,<imei>,<status>,<datetime>,<gps_fix>,<lat>,<lat_dir>,<lon>,<lon_dir>,<altitude>,<speed>,<distance>,<provider>,<vehicle_reg>*
 */
function parseEmergency(data) {
  const cleanData = data.replace(/\*[A-F0-9]{8}$/, '').replace('*', '');
  const parts = cleanData.split(',');
  
  if (parts[0] !== '$EPB' || parts.length < 16) return null;

  const latitude = parseFloat(parts[6]) || 0;
  const latDir = parts[7] || 'N';
  const longitude = parseFloat(parts[8]) || 0;
  const lonDir = parts[9] || 'E';

  return {
    protocol: PROTOCOL,
    type: 'EMERGENCY',
    packetType: parts[1] || 'EMR',
    imei: parts[2] || '',
    packetStatus: parts[3] || 'NM',
    date: parts[4] || '',
    gpsTime: parseEmergencyDateTime(parts[4]),
    gpsFix: parts[5] === 'A',
    latitude: convertDMSToDecimal(latitude, latDir),
    latitudeDirection: latDir,
    longitude: convertDMSToDecimal(longitude, lonDir),
    longitudeDirection: lonDir,
    altitude: parseFloat(parts[10]) || 0,
    speed: parseFloat(parts[11]) || 0,
    distance: parseFloat(parts[12]) || 0,
    provider: parts[13] || 'G',
    vehicleReg: parts[14] || '',
    rawData: data,
  };
}

/**
 * Parse Activation/Health Check Response
 */
function parseActivationResponse(data) {
  const parts = data.split(',');
  if (parts.length < 23) return null;
  
  const type = parts[0];
  if (type !== 'HCHKR' && type !== 'ACTVR') return null;

  return {
    protocol: PROTOCOL,
    type: type === 'HCHKR' ? 'HEALTH_CHECK_RESPONSE' : 'ACTIVATION_RESPONSE',
    randomCode: parts[1] || '',
    vendorId: parts[2] || '',
    firmwareVersion: parts[3] || '',
    imei: parts[4] || '',
    alertId: parts[5] || '',
    latitude: convertDMSToDecimal(parseFloat(parts[6]) || 0, parts[7] || 'N'),
    longitude: convertDMSToDecimal(parseFloat(parts[8]) || 0, parts[9] || 'E'),
    gpsFix: parts[10] === '1',
    date: parts[11] || '',
    gpsTime: parseEmergencyDateTime(parts[11]),
    heading: parseFloat(parts[12]) || 0,
    speed: parseFloat(parts[13]) || 0,
    gsmStrength: parseInt(parts[14]) || 0,
    mcc: parts[15] || '',
    mnc: parts[16] || '',
    lac: parts[17] || '',
    mainPower: parts[18] === '1',
    ignition: parts[19] === '1',
    batteryVoltage: parseFloat(parts[20]) || 0,
    frameNumber: parts[21] || '',
    mode: parseInt(parts[22]) || 0,
    rawData: data,
  };
}

// ============================================
// Utility Functions
// ============================================

function convertDMSToDecimal(value, direction) {
  if (!value || isNaN(value)) return 0;
  const degrees = Math.floor(value / 100);
  const minutes = value - (degrees * 100);
  let decimal = degrees + (minutes / 60);
  if (direction === 'S' || direction === 'W') decimal = -decimal;
  return parseFloat(decimal.toFixed(6));
}

function parseGPSDateTime(dateStr, timeStr) {
  try {
    if (dateStr.length !== 8 || timeStr.length !== 6) return new Date();
    const day = parseInt(dateStr.substring(0, 2));
    const month = parseInt(dateStr.substring(2, 4)) - 1;
    const year = parseInt(dateStr.substring(4, 8));
    const hour = parseInt(timeStr.substring(0, 2));
    const minute = parseInt(timeStr.substring(2, 4));
    const second = parseInt(timeStr.substring(4, 6));
    return new Date(year, month, day, hour, minute, second);
  } catch (e) {
    return new Date();
  }
}

function parseEmergencyDateTime(datetimeStr) {
  try {
    if (datetimeStr.length !== 14) return new Date();
    const day = parseInt(datetimeStr.substring(0, 2));
    const month = parseInt(datetimeStr.substring(2, 4)) - 1;
    const year = parseInt(datetimeStr.substring(4, 8));
    const hour = parseInt(datetimeStr.substring(8, 10));
    const minute = parseInt(datetimeStr.substring(10, 12));
    const second = parseInt(datetimeStr.substring(12, 14));
    return new Date(year, month, day, hour, minute, second);
  } catch (e) {
    return new Date();
  }
}

function parseFuelData(misc3) {
  if (!misc3 || misc3 === '-' || !misc3.startsWith('FUEL')) return null;
  const parts = misc3.split('|');
  return {
    source: parseInt(parts[1]) || 0,
    level: parseFloat(parts[2]) || 0,
    errorCode: parseInt(parts[parts.length - 1]) || 0,
    valid: parseInt(parts[parts.length - 1]) === 0,
  };
}

function parseTemperatureData(misc4) {
  if (!misc4 || misc4 === '-' || (!misc4.startsWith('TEMP') && !misc4.startsWith('TRH'))) return null;
  const parts = misc4.split('|');
  
  if (misc4.startsWith('TRH')) {
    return {
      type: 'humidity',
      temperature: parseFloat(parts[1]) || 0,
      humidity: parseFloat(parts[2]) || 0,
      alarms: parseInt(parts[3]) || 0,
      errorCode: parseInt(parts[4]) || 0,
      valid: parseInt(parts[4]) === 0,
    };
  }
  return {
    type: 'temperature',
    temperature: parseFloat(parts[1]) || 0,
    alarms: parseInt(parts[2]) || 0,
    errorCode: parseInt(parts[3]) || 0,
    valid: parseInt(parts[3]) === 0,
  };
}

/**
 * Get alert name from alert ID
 */
function getAlertName(alertId) {
  const alertMap = {
    '1': 'Location Update', '2': 'Location Update (History)',
    '3': 'Mains Off', '4': 'Low Battery', '5': 'Low Battery Removed',
    '6': 'Mains On', '7': 'Ignition On', '8': 'Ignition Off',
    '9': 'Temper Alert', '10': 'Emergency On', '11': 'Emergency Off',
    '12': 'OTA Alert', '13': 'Harsh Breaking', '14': 'Harsh Acceleration',
    '15': 'Rash Turning', '16': 'Wire Disconnect', '17': 'Overspeed',
    '18': 'Geofence In', '19': 'Geofence Out', '22': 'Tilt Alert',
    '306': 'Motion Start', '31': 'Motion Stop', '32': 'Relay Event',
    '33': 'New ID', '36': 'Temp High', '37': 'Temp Low', '40': 'FOTA Failed',
  };
  return alertMap[alertId] || `Unknown (${alertId})`;
}

/**
 * Map packet type to alert name
 */
function getAlertFromPacketType(packetType) {
  const typeMap = {
    'EA': 'Emergency Alert', 'TA': 'Temper Alert',
    'IN': 'Ignition On', 'IF': 'Ignition Off',
    'BD': 'Battery Disconnected', 'BR': 'Battery Reconnected',
    'BL': 'Battery Low', 'HB': 'Harsh Braking',
    'HA': 'Harsh Acceleration', 'RT': 'Rash Turning',
    'TI': 'Tilt Alert', 'WD': 'Wire Disconnect',
    'OS': 'Overspeed', 'GI': 'Geofence In', 'GO': 'Geofence Out',
  };
  return typeMap[packetType] || 'Unknown Alert';
}

module.exports = {
  parse,
  getAlertName,
  getAlertFromPacketType,
  PROTOCOL,
};