// Simple test script to verify login works
const http = require('http');

const testLogin = (email, password) => {
  const data = JSON.stringify({ email, password });
  
  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    
    res.on('data', (chunk) => {
      body += chunk;
    });
    
    res.on('end', () => {
      console.log('\n✅ Login Test Result:');
      console.log('Status Code:', res.statusCode);
      console.log('Response:', JSON.parse(body));
      
      if (res.statusCode === 200) {
        console.log('\n🎉 SUCCESS! Login works correctly.');
        console.log('You can now use these credentials in the mobile app:');
        console.log(`  Email: ${email}`);
        console.log(`  Password: ${password}`);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error:', error);
  });

  req.write(data);
  req.end();
};

console.log('🧪 Testing login endpoint...');
testLogin('user@example.com', 'password123');
