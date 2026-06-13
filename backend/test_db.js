const { pool } = require('./src/config/db');

async function test() {
  try {
    const groupsRes = await pool.query('SELECT * FROM groups');
    console.log('GROUPS:');
    console.log(groupsRes.rows);

    const vgRes = await pool.query('SELECT * FROM vehicle_groups');
    console.log('VEHICLE GROUPS:');
    console.log(vgRes.rows);

    const vehiclesRes = await pool.query('SELECT id, vehicle_name, registration_number FROM vehicles LIMIT 5');
    console.log('VEHICLES (first 5):');
    console.log(vehiclesRes.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

test();
