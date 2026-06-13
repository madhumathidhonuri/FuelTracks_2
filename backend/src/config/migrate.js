/**
 * FuelTracks Database Migration Script
 * Creates all required tables for the application
 * 
 * Usage: node src/config/migrate.js
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'fueltracks',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

const migrations = [
  // Enable UUID extension
  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,

  // Organizations table
  `CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    description TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    mobile VARCHAR(50),
    fleet_os_email VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    timezone VARCHAR(100) DEFAULT 'Asia/Kolkata',
    start_time VARCHAR(50),
    end_time VARCHAR(50),
    geofence_enabled BOOLEAN DEFAULT false,
    parking_alert BOOLEAN DEFAULT false,
    idle_alert BOOLEAN DEFAULT false,
    overspeed_alert BOOLEAN DEFAULT false,
    towing_alert BOOLEAN DEFAULT true,
    tamper_alert BOOLEAN DEFAULT true,
    idle_duration INTEGER DEFAULT 10,
    parking_duration INTEGER DEFAULT 10,
    overspeed_limit INTEGER DEFAULT 80,
    overspeed_duration INTEGER DEFAULT 0,
    unauthorised_movement_alert BOOLEAN DEFAULT false,
    no_data_duration VARCHAR(100),
    sos_alert BOOLEAN DEFAULT false,
    power_cut_off_alarm_duration INTEGER DEFAULT 0,
    harsh_breaking_alert BOOLEAN DEFAULT false,
    route_deviation_meters INTEGER DEFAULT 500,
    daily_summary_enabled BOOLEAN DEFAULT false,
    trip_planned_time BOOLEAN DEFAULT false,
    daily_diesel_summary BOOLEAN DEFAULT false,
    fuel_level_below BOOLEAN DEFAULT false,
    ongoing_fuel_alerts BOOLEAN DEFAULT false,
    fuel_notification_alert VARCHAR(100) DEFAULT 'Always',
    fuel_alarm BOOLEAN DEFAULT false,
    geofence_fuel_alert VARCHAR(100) DEFAULT 'Both',
    excess_consumption_filter BOOLEAN DEFAULT false,
    instant_fuel_alerts BOOLEAN DEFAULT false,
    verified_fuel_fill_theft_alert BOOLEAN DEFAULT true,
    sms_sender VARCHAR(100),
    sms_provider VARCHAR(100),
    sms_username VARCHAR(255),
    sms_password VARCHAR(255),
    sms_sender_id VARCHAR(100),
    sms_entity_name VARCHAR(255),
    sms_pattern VARCHAR(100),
    sms_escalation BOOLEAN DEFAULT false,
    show_geofences BOOLEAN DEFAULT false,
    whatsapp_enabled BOOLEAN DEFAULT false,
    telegram_enabled BOOLEAN DEFAULT false,
    rfid_enabled BOOLEAN DEFAULT false,
    school_geofence BOOLEAN DEFAULT false,
    geofence_immobilizer BOOLEAN DEFAULT false,
    send_geofence_sms VARCHAR(100),
    geofence VARCHAR(100),
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // Users table
  `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    username VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'user',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    alternate_email VARCHAR(255),
    zoho VARCHAR(255),
    enable_debugs VARCHAR(50) DEFAULT 'Disable',
    user_mode VARCHAR(50) DEFAULT 'virtual',
    selected_groups JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // Groups table
  `CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // Devices table
  `CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    imei VARCHAR(50) UNIQUE NOT NULL,
    device_name VARCHAR(255),
    device_type VARCHAR(50) DEFAULT 'GPS',
    vendor_id VARCHAR(50),
    firmware_version VARCHAR(50),
    phone_number VARCHAR(50),
    sim_number VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    model VARCHAR(100),
    plan VARCHAR(50),
    assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    onboard_date TIMESTAMP,
    licence_expire_date TIMESTAMP,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // Vehicles table
  `CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    registration_number VARCHAR(50),
    vehicle_name VARCHAR(255),
    vehicle_identifier VARCHAR(255),
    gps_sim_no VARCHAR(50),
    timezone VARCHAR(100) DEFAULT 'Asia/Kolkata',
    apn VARCHAR(100),
    licence_issued_date TIMESTAMP,
    onboard_date TIMESTAMP,
    licence_expire_date TIMESTAMP,
    vehicle_type VARCHAR(50) DEFAULT 'car',
    make VARCHAR(100),
    model VARCHAR(100),
    year VARCHAR(10),
    color VARCHAR(50),
    fuel_type VARCHAR(50),
    tank_capacity DECIMAL(10,2),
    odometer DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    latitude DECIMAL(11,7),
    longitude DECIMAL(12,7),
    speed DECIMAL(6,2) DEFAULT 0,
    heading DECIMAL(5,2) DEFAULT 0,
    ignition BOOLEAN DEFAULT false,
    last_location_update TIMESTAMP,
    last_seen TIMESTAMP,
    service_engineer VARCHAR(255),
    salesman VARCHAR(255),
    ticket_id VARCHAR(255),
    sensor_no VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // Locations table (GPS tracking data)
  `CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    latitude DECIMAL(11,7) NOT NULL,
    longitude DECIMAL(12,7) NOT NULL,
    speed DECIMAL(6,2) DEFAULT 0,
    heading DECIMAL(5,2) DEFAULT 0,
    altitude DECIMAL(8,2) DEFAULT 0,
    odometer DECIMAL(12,2) DEFAULT 0,
    ignition BOOLEAN DEFAULT false,
    main_power BOOLEAN DEFAULT true,
    main_voltage DECIMAL(5,2) DEFAULT 0,
    battery_voltage DECIMAL(5,2) DEFAULT 0,
    satellites INTEGER DEFAULT 0,
    gsm_strength INTEGER DEFAULT 0,
    digital_inputs VARCHAR(10),
    digital_outputs VARCHAR(10),
    analog_input1 INTEGER DEFAULT 0,
    analog_input2 INTEGER DEFAULT 0,
    gps_valid BOOLEAN DEFAULT false,
    gps_time TIMESTAMP,
    server_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    raw_data JSONB,
    frame_number VARCHAR(20)
  );`,

  // Trips table
  `CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    start_location JSONB,
    end_location JSONB,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    distance DECIMAL(10,2) DEFAULT 0,
    duration INTEGER DEFAULT 0,
    max_speed DECIMAL(6,2) DEFAULT 0,
    avg_speed DECIMAL(6,2) DEFAULT 0,
    fuel_consumed DECIMAL(8,2),
    start_odometer DECIMAL(12,2),
    end_odometer DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // Alerts table
  `CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    alert_type VARCHAR(100) NOT NULL,
    alert_id VARCHAR(50),
    severity VARCHAR(50) DEFAULT 'warning',
    latitude DECIMAL(11,7),
    longitude DECIMAL(12,7),
    speed DECIMAL(6,2),
    heading DECIMAL(5,2),
    message TEXT,
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP,
    gps_time TIMESTAMP,
    server_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    raw_data JSONB
  );`,

  // Sensor data table
  `CREATE TABLE IF NOT EXISTS sensor_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    sensor_type VARCHAR(50) NOT NULL,
    sensor_value DECIMAL(12,4),
    unit VARCHAR(20),
    latitude DECIMAL(11,7),
    longitude DECIMAL(12,7),
    gps_time TIMESTAMP,
    server_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    raw_data JSONB
  );`,

  // Audit logs table
  `CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    user_name VARCHAR(255),
    user_ip VARCHAR(50),
    action VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id UUID,
    entity_name VARCHAR(255),
    old_values TEXT,
    new_values TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // Licences table
  `CREATE TABLE IF NOT EXISTS licences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    licence_key VARCHAR(255) UNIQUE,
    plan_type VARCHAR(50) DEFAULT 'basic',
    max_vehicles INTEGER DEFAULT 10,
    max_users INTEGER DEFAULT 5,
    features JSONB DEFAULT '[]',
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    tier VARCHAR(50),
    total_count INTEGER DEFAULT 0,
    used_count INTEGER DEFAULT 0,
    expire_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // vehicle_groups table
  `CREATE TABLE IF NOT EXISTS vehicle_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_vehicle_group UNIQUE(vehicle_id, group_id)
  );`,

  // user_groups table
  `CREATE TABLE IF NOT EXISTS user_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_group UNIQUE(user_id, group_id)
  );`,

  // Create indexes for performance
  `CREATE INDEX IF NOT EXISTS idx_locations_vehicle_time ON locations(vehicle_id, server_time DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_locations_device_time ON locations(device_id, server_time DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_vehicles_org ON vehicles(organization_id);`,
  `CREATE INDEX IF NOT EXISTS idx_vehicles_device ON vehicles(device_id);`,
  `CREATE INDEX IF NOT EXISTS idx_alerts_vehicle_time ON alerts(vehicle_id, server_time DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_alerts_org_time ON alerts(organization_id, server_time DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);`,
  `CREATE INDEX IF NOT EXISTS idx_devices_imei ON devices(imei);`,
  `CREATE INDEX IF NOT EXISTS idx_sensor_vehicle_time ON sensor_data(vehicle_id, server_time DESC);`,
  `CREATE TABLE IF NOT EXISTS archived_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL,
    audit_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS rfid_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quantity INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,
  `ALTER TABLE organizations ADD COLUMN IF NOT EXISTS sms_username VARCHAR(255);`,
  `ALTER TABLE organizations ADD COLUMN IF NOT EXISTS sms_password VARCHAR(255);`,
  `ALTER TABLE organizations ADD COLUMN IF NOT EXISTS sms_sender_id VARCHAR(100);`,
  `ALTER TABLE organizations ADD COLUMN IF NOT EXISTS sms_entity_name VARCHAR(255);`,
  `ALTER TABLE organizations ADD COLUMN IF NOT EXISTS show_geofences BOOLEAN DEFAULT false;`,
];


async function runMigrations() {
  console.log('🚀 Starting FuelTracks database migration...\n');
  
  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    client.release();

    // Run each migration
    for (let i = 0; i < migrations.length; i++) {
      const sql = migrations[i];
      try {
        await pool.query(sql);
        const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] || 'Index';
        console.log(`  ✅ ${tableName}`);
      } catch (err) {
        if (err.code !== '42P07' && err.code !== '42710') { // Table/index already exists
          console.error(`  ❌ Error: ${err.message}`);
        }
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nTables created:');
    console.log('  - organizations');
    console.log('  - users');
    console.log('  - groups');
    console.log('  - devices');
    console.log('  - vehicles');
    console.log('  - locations');
    console.log('  - trips');
    console.log('  - alerts');
    console.log('  - sensor_data');
    console.log('  - audit_logs');
    console.log('  - licences');
    console.log('  - vehicle_groups');
    console.log('  - user_groups');
    console.log('  - rfid_tags');





  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    console.error('\nMake sure PostgreSQL is running and the database exists:');
    console.error('  createdb fueltracks');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };