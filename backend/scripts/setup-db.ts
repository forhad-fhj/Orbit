/**
 * Database setup script
 * This script helps set up the database connection and run migrations
 * 
 * Usage:
 *   npx tsx scripts/setup-db.ts
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('\n🗄️  Orbit Database Setup\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env file');
    console.error('Please add: DATABASE_URL="postgresql://user:password@localhost:5432/orbit"');
    process.exit(1);
  }

  console.log('📋 Database URL:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));

  try {
    // Test connection
    console.log('\n🔌 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // Check if database is empty
    const userCount = await prisma.user.count();
    console.log(`📊 Current database state:`);
    console.log(`   - Users: ${userCount}`);
    
    if (userCount === 0) {
      console.log('\n💡 Database is empty. Run migrations to create tables:');
      console.log('   npm run prisma:migrate');
    }

    console.log('\n✅ Database setup complete!\n');
  } catch (error: any) {
    console.error('\n❌ Database connection failed:');
    console.error('   Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Ensure PostgreSQL is running');
    console.error('   2. Check DATABASE_URL in .env file');
    console.error('   3. Verify database exists');
    console.error('   4. Check network connectivity\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

