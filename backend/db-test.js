const { query } = require('./src/config/db');
const jwt = require('./src/utils/jwt.utils');
const { comparePassword } = require('./src/utils/hash.utils');

async function test() {
  try {
    console.log('Querying all users...');
    const res = await query('SELECT * FROM users');
    console.log(`Found ${res.rows.length} users. Testing login simulation on each...`);
    
    for (const user of res.rows) {
      try {
        const accessToken = jwt.generateAccessToken(user);
        const refreshToken = jwt.generateRefreshToken(user);
        
        const userData = {
          id: user.id,
          username: user.username || user.email,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || user.email,
          email: user.email,
          role: user.role,
          organizationId: user.organization_id,
        };
        
        // Log success
        // console.log(`Success for user: ${user.username || user.email}`);
      } catch (err) {
        console.error(`!!! CRASH FOR USER ${user.username || user.email}:`, err);
      }
    }
    console.log('Test completed!');
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
