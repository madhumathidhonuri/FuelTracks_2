/**
 * FuelTracks TCP Server Manager
 * Starts and manages all TCP protocol servers
 * 
 * Ports:
 * - 9001: AIS-140 (tnavic)
 * - 9002: BSTP-15 (BS Technotronics)
 * - 9003: BSTPL-17 (BS Technotronics)
 */

require('dotenv').config();
const net = require('net');

// Import protocol parsers
const ais140Parser = require('./ais140/parser');
const bstp15Parser = require('./bstp15/parser');
const bstpl17Parser = require('./bstpl17/parser');

// Import shared utilities
const db = require('./shared/db-utils');

// Configuration from environment
const PORTS = {
  ais140: parseInt(process.env.TCP_AIS140_PORT) || 9001,
  bstp15: parseInt(process.env.TCP_BSTP15_PORT) || 9002,
  bstpl17: parseInt(process.env.TCP_BSTPL17_PORT) || 9003,
};

// Active servers
const servers = {};

/**
 * Create a TCP server for a specific protocol
 */
function createTCPServer(protocolName, port, parser) {
  const server = net.createServer((socket) => {
    const clientAddr = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`\n[${protocolName.toUpperCase()}] Device connected: ${clientAddr}`);
    
    let buffer = '';
    
    socket.on('data', async (data) => {
      buffer += data.toString();
      
      // For BSTP-15/BSTPL-17: packets end with #
      // For AIS-140: packets end with * (and may have checksum)
      
      let delimiter = protocolName === 'ais140' ? '*' : '#';
      const packets = buffer.split(delimiter);
      
      // Keep incomplete packet in buffer
      buffer = packets.pop() || '';
      
      for (const packetData of packets) {
        if (!packetData.trim()) continue;
        
        const fullPacket = protocolName === 'ais140' 
          ? packetData + '*' 
          : '$' + protocolName.toUpperCase().replace('BSTPL', '10') + ',' + packetData + '#';
        
        // For BSTP/BSTPL, reconstruct properly
        let reconstructedPacket;
        if (protocolName !== 'ais140') {
          reconstructedPacket = packetData.startsWith('$10') || packetData.startsWith('$11') 
            ? packetData + '#' 
            : packetData;
        } else {
          reconstructedPacket = fullPacket;
        }
        
        try {
          const parsed = parser.parse(reconstructedPacket);
          
          if (parsed) {
            await handlePacket(protocolName, parsed, socket);
          } else {
            console.log(`[${protocolName}] Unknown packet: ${reconstructedPacket.substring(0, 50)}...`);
          }
        } catch (err) {
          console.error(`[${protocolName}] Parse error:`, err.message);
        }
      }
    });
    
    socket.on('error', (err) => {
      console.error(`[${protocolName}] Socket error: ${err.message}`);
      cleanupDevice(protocolName, socket);
    });
    
    socket.on('close', () => {
      console.log(`[${protocolName}] Device disconnected: ${clientAddr}`);
      cleanupDevice(protocolName, socket);
    });
  });
  
  server.on('error', (err) => {
    console.error(`[${protocolName}] Server error:`, err.message);
  });
  
  server.on('listening', () => {
    console.log(`📡 [${protocolName.toUpperCase()}] TCP Server listening on port ${port}`);
  });
  
  return server;
}

/**
 * Handle parsed packet based on type
 */
async function handlePacket(protocol, parsed, socket) {
  switch (parsed.type) {
    case 'LOGIN':
      await handleLogin(protocol, parsed, socket);
      break;
      
    case 'HEALTH':
      console.log(`[${protocol}] Health from ${parsed.imei}: Battery ${parsed.batteryPercentage}%`);
      socket.write('ACK\r\n');
      break;
      
    case 'LOCATION':
      await handleLocation(protocol, parsed);
      socket.write('ACK\r\n');
      break;
      
    case 'ALERT':
      await handleAlert(protocol, parsed);
      socket.write('ACK\r\n');
      break;
      
    case 'EMERGENCY':
      await handleEmergency(protocol, parsed);
      socket.write('ACK\r\n');
      break;
      
    case 'OTA_ACK':
      console.log(`[${protocol}] OTA ACK from ${parsed.imei}`);
      socket.write('ACK\r\n');
      break;
      
    case 'HEALTH_CHECK_RESPONSE':
    case 'ACTIVATION_RESPONSE':
      console.log(`[${protocol}] ${parsed.type} from ${parsed.imei}`);
      break;
      
    default:
      console.log(`[${protocol}] Unknown packet type: ${parsed.type}`);
  }
}

/**
 * Handle login packet
 */
async function handleLogin(protocol, parsed, socket) {
  try {
    // For AIS-140, use IMEI directly
    // For BSTP/BSTPL, might need to look up by vehicle ID
    let imei = parsed.imei || parsed.vehicleId;
    
    const device = await db.findDeviceByImei(imei);
    
    if (device) {
      // Register device
      db.registerDevice(protocol, imei, {
        socket,
        device,
        deviceName: parsed.deviceName || parsed.vehicleId || imei,
      });
      
      console.log(`[${protocol}] Device logged in: ${imei}`);
      
      // Try to find vehicle
      const vehicle = await db.findVehicleByDevice(device.id);
      if (vehicle) {
        const info = db.getConnectedDevices(protocol).get(imei);
        info.vehicle = vehicle;
        console.log(`[${protocol}] → Mapped to vehicle: ${vehicle.registration_number}`);
      }
      
      socket.write('LOGINOK\r\n');
    } else {
      console.log(`[${protocol}] Unknown device: ${imei}`);
      socket.write('LOGINFAIL\r\n');
    }
  } catch (err) {
    console.error(`[${protocol}] Login error:`, err.message);
    socket.write('LOGINFAIL\r\n');
  }
}

/**
 * Handle location packet
 */
async function handleLocation(protocol, parsed) {
  try {
    // Determine IMEI from parsed data
    let imei = parsed.imei || parsed.vehicleId;
    
    // Update device activity
    db.updateDeviceActivity(protocol, imei);
    
    // Save location
    const result = await db.saveLocation(parsed, protocol);
    
    if (result) {
      console.log(`[${protocol}] Location: ${imei} | ${parsed.latitude.toFixed(5)},${parsed.longitude.toFixed(5)} | ${parsed.speed}km/h | ${parsed.ignition ? 'ON' : 'OFF'}`);
    }
  } catch (err) {
    console.error(`[${protocol}] Location error:`, err.message);
  }
}

/**
 * Handle alert packet
 */
async function handleAlert(protocol, parsed) {
  try {
    let imei = parsed.imei || parsed.vehicleId;
    
    console.log(`[${protocol}] ⚠️ ALERT: ${parsed.alertName || parsed.alertId} from ${imei}`);
    
    const severity = parsed.severity || 'warning';
    const alertType = parsed.alertName || parsed.alertId || 'Unknown Alert';
    
    await db.saveAlert(parsed, protocol, alertType, severity);
  } catch (err) {
    console.error(`[${protocol}] Alert error:`, err.message);
  }
}

/**
 * Handle emergency packet
 */
async function handleEmergency(protocol, parsed) {
  try {
    let imei = parsed.imei || parsed.vehicleId;
    
    console.log(`[${protocol}] 🚨 EMERGENCY from ${imei} | ${parsed.latitude},${parsed.longitude}`);
    
    await db.saveAlert(parsed, protocol, 'EMERGENCY', 'critical');
  } catch (err) {
    console.error(`[${protocol}] Emergency error:`, err.message);
  }
}

/**
 * Cleanup device on disconnect
 */
function cleanupDevice(protocol, socket) {
  const devices = db.getConnectedDevices(protocol);
  for (const [imei, info] of devices) {
    if (info.socket === socket) {
      db.unregisterDevice(protocol, imei);
      console.log(`[${protocol}] Device cleaned up: ${imei}`);
      break;
    }
  }
}

/**
 * Start all TCP servers
 */
function startAllServers() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  FuelTracks TCP Server Manager');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Start AIS-140 Server
  servers.ais140 = createTCPServer('ais140', PORTS.ais140, ais140Parser);
  servers.ais140.listen(PORTS.ais140);
  
  // Start BSTP-15 Server
  servers.bstp15 = createTCPServer('bstp15', PORTS.bstp15, bstp15Parser);
  servers.bstp15.listen(PORTS.bstp15);
  
  // Start BSTPL-17 Server
  servers.bstpl17 = createTCPServer('bstpl17', PORTS.bstpl17, bstpl17Parser);
  servers.bstpl17.listen(PORTS.bstpl17);
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  All TCP Servers Started');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  AIS-140:  port ${PORTS.ais140}`);
  console.log(`  BSTP-15:  port ${PORTS.bstp15}`);
  console.log(`  BSTPL-17: port ${PORTS.bstpl17}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Periodic status report
  setInterval(() => {
    const summary = db.getConnectionSummary();
    if (summary.total > 0) {
      console.log(`[TCP] Active connections: AIS=${summary.ais140}, BSTP15=${summary.bstp15}, BSTPL17=${summary.bstpl17}`);
    }
  }, 60000);
  
  return servers;
}

/**
 * Stop all servers
 */
function stopAllServers() {
  console.log('\n[TCP] Shutting down all servers...');
  for (const [name, server] of Object.entries(servers)) {
    server.close();
    console.log(`[TCP] ${name} server stopped`);
  }
}

// ============================================
// Main
// ============================================

if (require.main === module) {
  startAllServers();
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('\n[TCP] SIGTERM received');
    stopAllServers();
    process.exit(0);
  });
  
  process.on('SIGINT', () => {
    console.log('\n[TCP] SIGINT received');
    stopAllServers();
    process.exit(0);
  });
}

module.exports = {
  startAllServers,
  stopAllServers,
  PORTS,
};