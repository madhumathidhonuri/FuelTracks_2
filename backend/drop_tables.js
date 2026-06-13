require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'fueltracks',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

const tables = [
  'sensor_data',
  'locations',
  'trips',
  'alerts',
  'audit_logs',
  'vehicles',
  'devices',
  'licences',
  'groups',
  'users',
  'organizations'
];

async function dropTables() {
  console.log('🗑️ Dropping existing tables...');
  const client = await pool.connect();
  try {
    for (const table of tables) {
      await client.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
      console.log(`  ✅ Dropped table: ${table}`);
    }
    console.log('🎉 All tables dropped successfully!');
  } catch (err) {
    console.error('❌ Error dropping tables:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

dropTables();
