const User = require('./src/models/User');
const jwt = require('./src/utils/jwt.utils');
const { comparePassword } = require('./src/utils/hash.utils');

async function test() {
  try {
    const username = 'admin@fueltracks.com';
    const password = 'admin123';

    console.log('Finding user by username:', username);
    const user = await User.findByUsername(username);
    console.log('User found:', user ? { id: user.id, username: user.username, email: user.email, role: user.role } : 'Not found');

    if (!user) return;

    console.log('Comparing password...');
    const isValid = await comparePassword(password, user.password_hash);
    console.log('Is valid password:', isValid);

    console.log('Generating access token...');
    const accessToken = jwt.generateAccessToken(user);
    console.log('Access token generated:', !!accessToken);

    console.log('Generating refresh token...');
    const refreshToken = jwt.generateRefreshToken(user);
    console.log('Refresh token generated:', !!refreshToken);

    console.log('Updating last login...');
    await User.updateLastLogin(user.id);
    console.log('Last login updated successfully');
  } catch (err) {
    console.error('Error during test-login:', err);
  }
}

test();
