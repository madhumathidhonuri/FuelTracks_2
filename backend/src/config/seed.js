/**
 * FuelTracks Database Seed Script
 * Creates default admin user for initial login
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

async function seedDatabase() {
  console.log('🌱 Starting FuelTracks database seeding...\n');

  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database\n');

    // Clean all tables before seeding
    console.log('🧹 Cleaning existing tables...');
    const tablesToTruncate = [
      'sensor_data',
      'locations',
      'trips',
      'alerts',
      'audit_logs',
      'archived_audit_logs',
      'rfid_tags',
      'vehicle_groups',
      'user_groups',
      'vehicles',
      'devices',
      'licences',
      'groups',
      'users',
      'organizations'
    ];
    await client.query(`TRUNCATE ${tablesToTruncate.join(', ')} CASCADE`);
    console.log('  ✅ Cleaned all tables successfully\n');

    // Create default admin user
    console.log('📝 Creating default admin user...');
    const passwordHash = await bcrypt.hash('admin123', 10);
    await client.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, true)`,
      ['admin', 'admin@fueltracks.com', passwordHash, 'Admin', 'User', 'admin']
    );
    console.log('  ✅ Created user: admin@fueltracks.com (Password: admin123)\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Database seeding completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

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