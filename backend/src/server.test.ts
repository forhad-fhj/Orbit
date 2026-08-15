/**
 * Simple server initialization test
 * This file can be used to verify the server setup is correct
 * Run with: npx tsx src/server.test.ts
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if required environment variables are set
function validateEnvironment() {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing: string[] = [];

  required.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    console.error('Please create a .env file with these variables.');
    return false;
  }

  console.log('✅ Environment variables validated');
  return true;
}

// Test imports
function testImports() {
  try {
    require('express');
    require('cors');
    require('cookie-parser');
    require('socket.io');
    require('jsonwebtoken');
    require('bcryptjs');
    require('zod');
    console.log('✅ All dependencies imported successfully');
    return true;
  } catch (error) {
    console.error('❌ Import error:', error);
    return false;
  }
}

// Main test function
function main() {
  console.log('\n🧪 Testing Orbit Backend Server Setup\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const envValid = validateEnvironment();
  const importsValid = testImports();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (envValid && importsValid) {
    console.log('✅ Server setup is valid!');
    console.log('You can now run: npm run dev\n');
    process.exit(0);
  } else {
    console.log('❌ Server setup has issues');
    console.log('Please fix the errors above before starting the server\n');
    process.exit(1);
  }
}

main();

