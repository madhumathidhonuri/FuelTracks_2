/**
 * FuelTracks Database Seed Script
 * Creates demo data for testing the application
 * 
 * Usage: node src/config/seed.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'fueltracks',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

// Demo organization data
const demoOrg = {
  name: 'FuelTracks Demo',
  address: '123 Tech Park, Bangalore, India',
  phone: '+91-9876543210',
  email: 'demo@fueltracks.com',
  is_active: true,
};

// Demo users (admin and user only)
const demoUsers = [
  {
    email: 'admin@fueltracks.com',
    password: 'admin123',
    first_name: 'Admin',
    last_name: 'User',
    phone: '+91-9876543211',
    role: 'admin',
  },
  {
    email: 'user@fueltracks.com',
    password: 'user123',
    first_name: 'Regular',
    last_name: 'User',
    phone: '+91-9876543213',
    role: 'user',
  },
];

// Demo devices (AIS-140 compatible)
const demoDevices = [
  { imei: '357586700123456', device_name: 'Device-Alpha-01', device_type: 'AIS140', vendor_id: 'TNOWTN', firmware_version: '2.1.0' },
  { imei: '357586700123457', device_name: 'Device-Beta-02', device_type: 'AIS140', vendor_id: 'TNOWTN', firmware_version: '2.1.0' },
  { imei: '357586700123458', device_name: 'Device-Gamma-03', device_type: 'AIS140', vendor_id: 'TNOWTN', firmware_version: '2.1.0' },
  { imei: '357586700123459', device_name: 'Device-Delta-04', device_type: 'AIS140', vendor_id: 'TNOWTN', firmware_version: '2.1.0' },
  { imei: '357586700123460', device_name: 'Device-Epsilon-05', device_type: 'AIS140', vendor_id: 'TNOWTN', firmware_version: '2.1.0' },
  { imei: '357586700123461', device_name: 'Device-Zeta-06', device_type: 'AIS140', vendor_id: 'TNOWTN', firmware_version: '2.1.0' },
  { imei: '357586700123462', device_name: 'Device-Eta-07', device_type: 'AIS140', vendor_id: 'TNOWTN', firmware_version: '2.1.0' },
  { imei: '357586700123463', device_name: 'Device-Theta-08', device_type: 'AIS140', vendor_id: 'TNOWTN', firmware_version: '2.1.0' },
  { imei: '357586700123464', device_name: 'Device-Iota-09', device_type: 'AIS140', vendor_id: 'TNOWTN', firmware_version: '2.1.0' },
  { imei: '357586700123465', device_name: 'Device-Kappa-10', device_type: 'AIS140', vendor_id: 'TNOWTN', firmware_version: '2.1.0' },
];

// Demo vehicles
const demoVehicles = [
  { registration_number: 'KA01AB1234', vehicle_type: 'car', make: 'Maruti', model: 'Swift', color: 'White', fuel_type: 'Petrol' },
  { registration_number: 'KA01CD5678', vehicle_type: 'car', make: 'Hyundai', model: 'Creta', color: 'Silver', fuel_type: 'Diesel' },
  { registration_number: 'KA01EF9012', vehicle_type: 'car', make: 'Toyota', model: 'Innova', color: 'White', fuel_type: 'Diesel' },
  { registration_number: 'KA02GH3456', vehicle_type: 'truck', make: 'Tata', model: 'Ace', color: 'White', fuel_type: 'Diesel' },
  { registration_number: 'KA02IJ7890', vehicle_type: 'truck', make: 'Ashok Leyland', model: 'Dost', color: 'Blue', fuel_type: 'Diesel' },
  { registration_number: 'KA03KL1234', vehicle_type: 'car', make: 'Honda', model: 'City', color: 'Grey', fuel_type: 'Petrol' },
  { registration_number: 'KA03MN5678', vehicle_type: 'car', make: 'Skoda', model: 'Rapid', color: 'Red', fuel_type: 'Petrol' },
  { registration_number: 'KA04OP9012', vehicle_type: 'bus', make: 'Tata', model: 'Starbus', color: 'Yellow', fuel_type: 'Diesel' },
  { registration_number: 'KA04QR3456', vehicle_type: 'car', make: 'Ford', model: 'EcoSport', color: 'Black', fuel_type: 'Diesel' },
  { registration_number: 'KA05ST7890', vehicle_type: 'car', make: 'Volkswagen', model: 'Polo', color: 'White', fuel_type: 'Petrol' },
];

// Demo groups
const demoGroups = [
  { name: 'Sales Team', description: 'Field sales vehicles' },
  { name: 'Delivery Fleet', description: 'Package delivery vehicles' },
  { name: 'Executive Cars', description: 'Management transportation' },
];

// Generate random location around Bangalore
function randomLocation() {
  const baseLat = 12.9716 + (Math.random() - 0.5) * 0.1;
  const baseLon = 77.5946 + (Math.random() - 0.5) * 0.1;
  return {
    latitude: baseLat + (Math.random() - 0.5) * 0.02,
    longitude: baseLon + (Math.random() - 0.5) * 0.02,
  };
}

// Generate random speed based on status
function randomSpeed(status) {
  if (status === 'moving') return Math.floor(Math.random() * 60) + 30;
  if (status === 'idle') return Math.floor(Math.random() * 5);
  return 0;
}

// Generate random status
function randomStatus() {
  const rand = Math.random();
  if (rand > 0.6) return 'moving';
  if (rand > 0.3) return 'idle';
  return 'stopped';
}

async function seedDatabase() {
  console.log('🌱 Starting FuelTracks database seeding...\n');

  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database\n');

    // Create organization
    const orgResult = await client.query(
      `INSERT INTO organizations (name, address, phone, email, is_active) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [demoOrg.name, demoOrg.address, demoOrg.phone, demoOrg.email, demoOrg.is_active]
    );
    
    let orgId;
    if (orgResult.rows.length > 0) {
      orgId = orgResult.rows[0].id;
      console.log(`✅ Created organization: ${demoOrg.name}`);
    } else {
      const existing = await client.query(`SELECT id FROM organizations WHERE name = $1`, [demoOrg.name]);
      orgId = existing.rows[0].id;
      console.log(`ℹ️  Organization already exists: ${demoOrg.name}`);
    }

    // Create users
    console.log('\n📝 Creating users...');
    for (const user of demoUsers) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      await client.query(
        `INSERT INTO users (organization_id, email, password_hash, first_name, last_name, phone, role, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, true) 
         ON CONFLICT (email) DO NOTHING`,
        [orgId, user.email, passwordHash, user.first_name, user.last_name, user.phone, user.role]
      );
      console.log(`  ✅ ${user.email} (${user.role})`);
    }

    // Create groups
    console.log('\n📁 Creating groups...');
    const groupIds = [];
    for (const group of demoGroups) {
      const result = await client.query(
        `INSERT INTO groups (organization_id, name, description) 
         VALUES ($1, $2, $3) 
         RETURNING id`,
        [orgId, group.name, group.description]
      );
      groupIds.push(result.rows[0].id);
      console.log(`  ✅ ${group.name}`);
    }

    // Create devices
    console.log('\n📡 Creating devices...');
    const deviceIds = [];
    for (const device of demoDevices) {
      const result = await client.query(
        `INSERT INTO devices (organization_id, imei, device_name, device_type, vendor_id, firmware_version, status) 
         VALUES ($1, $2, $3, $4, $5, $6, 'active') 
         ON CONFLICT (imei) DO NOTHING
         RETURNING id`,
        [orgId, device.imei, device.device_name, device.device_type, device.vendor_id, device.firmware_version]
      );
      if (result.rows.length > 0) {
        deviceIds.push(result.rows[0].id);
        console.log(`  ✅ ${device.device_name} (IMEI: ${device.imei})`);
      } else {
        const existing = await client.query(`SELECT id FROM devices WHERE imei = $1`, [device.imei]);
        deviceIds.push(existing.rows[0].id);
      }
    }

    // Create vehicles
    console.log('\n🚗 Creating vehicles...');
    const vehicleIds = [];
    for (let i = 0; i < demoVehicles.length; i++) {
      const vehicle = demoVehicles[i];
      const status = randomStatus();
      const loc = randomLocation();
      const speed = randomSpeed(status);
      const groupIndex = Math.floor(Math.random() * groupIds.length);
      const deviceIndex = Math.min(i, deviceIds.length - 1);

      const result = await client.query(
        `INSERT INTO vehicles (organization_id, group_id, device_id, registration_number, vehicle_type, make, model, color, fuel_type, status, latitude, longitude, speed, heading, ignition, last_location_update, last_seen) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW()) 
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [orgId, groupIds[groupIndex], deviceIds[deviceIndex], vehicle.registration_number, vehicle.vehicle_type, vehicle.make, vehicle.model, vehicle.color, vehicle.fuel_type, status, loc.latitude, loc.longitude, speed, Math.floor(Math.random() * 360), status === 'moving']
      );
      if (result.rows.length > 0) {
        vehicleIds.push(result.rows[0].id);
        console.log(`  ✅ ${vehicle.registration_number} (${vehicle.make} ${vehicle.model}) - ${status}`);
      }
    }

    // Generate sample location history
    console.log('\n📍 Generating location history...');
    let locationCount = 0;
    for (const vehicleId of vehicleIds) {
      const numLocations = Math.floor(Math.random() * 50) + 20;
      for (let j = 0; j < numLocations; j++) {
        const loc = randomLocation();
        const hoursAgo = Math.floor(Math.random() * 72);
        const gpsTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
        
        await client.query(
          `INSERT INTO locations (vehicle_id, device_id, latitude, longitude, speed, heading, ignition, satellites, gsm_strength, gps_valid, gps_time, server_time)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, $10, $11)`,
          [vehicleId, deviceIds[0], loc.latitude, loc.longitude, randomSpeed('moving'), Math.floor(Math.random() * 360), true, Math.floor(Math.random() * 15) + 5, Math.floor(Math.random() * 31) + 1, gpsTime, gpsTime]
        );
        locationCount++;
      }
    }
    console.log(`  ✅ Created ${locationCount} location records`);

    // Generate sample alerts
    console.log('\n⚠️  Generating alerts...');
    const alertTypes = ['Overspeed', 'Ignition On', 'Ignition Off', 'Low Battery', 'Harsh Braking', 'Geofence Exit'];
    for (let i = 0; i < 15; i++) {
      const vehicleIndex = Math.floor(Math.random() * vehicleIds.length);
      const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const loc = randomLocation();
      const hoursAgo = Math.floor(Math.random() * 48);
      const gpsTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

      await client.query(
        `INSERT INTO alerts (vehicle_id, organization_id, alert_type, severity, latitude, longitude, speed, gps_time, server_time, acknowledged)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [vehicleIds[vehicleIndex], orgId, alertType, alertType === 'Overspeed' ? 'critical' : 'warning', loc.latitude, loc.longitude, Math.floor(Math.random() * 80) + 60, gpsTime, gpsTime, Math.random() > 0.5]
      );
    }
    console.log(`  ✅ Created 15 sample alerts`);

    // Create demo licence
    console.log('\n🔑 Creating demo licence...');
    await client.query(
      `INSERT INTO licences (organization_id, licence_key, plan_type, max_vehicles, max_users, start_date, end_date, is_active)
       VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', true)
       ON CONFLICT DO NOTHING`,
      [orgId, 'DEMO-' + Math.random().toString(36).substring(2, 10).toUpperCase(), 'premium', 100, 50]
    );
    console.log(`  ✅ Premium licence created`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Database seeding completed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin: admin@fueltracks.com / admin123');
    console.log('   User:  user@fueltracks.com / user123');
    console.log('\n📊 Demo Data:');
    console.log(`   Organizations: 1`);
    console.log(`   Users: ${demoUsers.length}`);
    console.log(`   Groups: ${demoGroups.length}`);
    console.log(`   Devices: ${demoDevices.length}`);
    console.log(`   Vehicles: ${demoVehicles.length}`);
    console.log(`   Locations: ${locationCount}+`);
    console.log(`   Alerts: 15`);
    console.log('');

    client.release();
  } catch (err) {
    console.error('\n❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };