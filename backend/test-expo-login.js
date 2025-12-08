// Test login using network IP (for Expo Go testing)
const http = require('http');

const MACHINE_IP = '192.168.29.41'; // Change this to your machine IP

const testLogin = (host, email, password) => {
  const data = JSON.stringify({ email, password });
  
  const options = {
    hostname: host,
    port: 4000,
    path: '/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    },
    timeout: 5000
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ success: true, data: JSON.parse(body) });
        } else {
          resolve({ success: false, status: res.statusCode, error: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(data);
    req.end();
  });
};

console.log('========================================');
console.log('Testing CrushIT Login from Expo Go perspective');
console.log('========================================\n');

(async () => {
  // Test 1: localhost
  console.log('Test 1: Testing localhost connection...');
  try {
    const result = await testLogin('localhost', 'user@example.com', 'password123');
    if (result.success) {
      console.log('✅ SUCCESS: localhost works!');
      console.log('   Token received:', result.data.token.substring(0, 20) + '...');
    } else {
      console.log('❌ FAILED: localhost returned status', result.status);
    }
  } catch (error) {
    console.log('❌ ERROR: Cannot connect to localhost:', error.message);
  }

  console.log('');

  // Test 2: Network IP (what Expo Go uses)
  console.log(`Test 2: Testing network IP (${MACHINE_IP})...`);
  try {
    const result = await testLogin(MACHINE_IP, 'user@example.com', 'password123');
    if (result.success) {
      console.log('✅ SUCCESS: Network IP works!');
      console.log('   Token received:', result.data.token.substring(0, 20) + '...');
      console.log('\n🎉 Your Expo Go app should be able to login successfully!');
    } else {
      console.log('❌ FAILED: Network IP returned status', result.status);
    }
  } catch (error) {
    console.log('❌ ERROR: Cannot connect via network IP:', error.message);
    console.log('\n⚠️  PROBLEM DETECTED:');
    console.log('   Your Expo Go app cannot reach the backend!');
    console.log('\nPossible solutions:');
    console.log('   1. Check if firewall is blocking port 4000');
    console.log('   2. Make sure phone and PC are on same WiFi network');
    console.log('   3. Run: New-NetFirewallRule -DisplayName "Node 4000" -Direction Inbound -LocalPort 4000 -Protocol TCP -Action Allow');
  }

  console.log('\n========================================');
})();
