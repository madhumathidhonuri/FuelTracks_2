async function trigger() {
  const url = 'http://localhost:5000/api/v1/auth/login';
  
  const testCases = [
    {
      name: 'Valid credentials',
      body: { email: 'admin@fueltracks.com', password: 'admin123' }
    },
    {
      name: 'Non-existent user',
      body: { email: 'nonexistent@fueltracks.com', password: 'password123' }
    },
    {
      name: 'Invalid email format (validation error)',
      body: { email: 'invalid-email', password: 'password123' }
    },
    {
      name: 'Default frontend placeholder details',
      body: { email: 'admin@fueltracks.io', password: 'password' }
    }
  ];

  for (const tc of testCases) {
    console.log(`\n--- Testing: ${tc.name} ---`);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tc.body)
      });
      console.log('Status:', res.status);
      const text = await res.text();
      console.log('Response:', text);
    } catch (err) {
      console.error('Fetch error:', err.message);
    }
  }
}

trigger();
