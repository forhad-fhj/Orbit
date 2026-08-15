/**
 * Database seed script
 * This script populates the database with sample data for development
 * 
 * Usage:
 *   npx tsx scripts/seed.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('\n🌱 Seeding database...\n');

  // Clear existing data (optional - comment out if you want to keep existing data)
  // await prisma.message.deleteMany();
  // await prisma.comment.deleteMany();
  // await prisma.like.deleteMany();
  // await prisma.follows.deleteMany();
  // await prisma.post.deleteMany();
  // await prisma.user.deleteMany();

  // Create sample users
  const passwordHash = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      username: 'alice',
      email: 'alice@example.com',
      passwordHash,
      bio: 'Hello! I love sharing my thoughts on Orbit.',
      avatarUrl: null,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      username: 'bob',
      email: 'bob@example.com',
      passwordHash,
      bio: 'Developer and tech enthusiast.',
      avatarUrl: null,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'charlie@example.com' },
    update: {},
    create: {
      username: 'charlie',
      email: 'charlie@example.com',
      passwordHash,
      bio: 'Just another user on Orbit.',
      avatarUrl: null,
    },
  });

  console.log('✅ Created users:', user1.username, user2.username, user3.username);

  // Create sample posts
  const post1 = await prisma.post.create({
    data: {
      authorId: user1.id,
      content: 'Welcome to Orbit! This is my first post. 🚀',
      mediaType: 'NONE',
    },
  });

  const post2 = await prisma.post.create({
    data: {
      authorId: user2.id,
      content: 'Just finished building an amazing feature! The power of TypeScript and Prisma is incredible.',
      mediaType: 'NONE',
    },
  });

  const post3 = await prisma.post.create({
    data: {
      authorId: user1.id,
      content: 'Beautiful sunset today! 🌅',
      mediaType: 'IMAGE',
      mediaUrl: 'https://example.com/sunset.jpg',
    },
  });

  console.log('✅ Created posts');

  // Create sample comments
  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: user2.id,
      content: 'Great first post! Welcome to Orbit!',
    },
  });

  await prisma.comment.create({
    data: {
      postId: post2.id,
      authorId: user1.id,
      content: 'That sounds amazing! Can you share more details?',
    },
  });

  console.log('✅ Created comments');

  // Create sample likes
  await prisma.like.create({
    data: {
      postId: post1.id,
      userId: user2.id,
    },
  });

  await prisma.like.create({
    data: {
      postId: post1.id,
      userId: user3.id,
    },
  });

  await prisma.like.create({
    data: {
      postId: post2.id,
      userId: user1.id,
    },
  });

  console.log('✅ Created likes');

  // Create sample follows
  await prisma.follows.create({
    data: {
      followerId: user2.id,
      followingId: user1.id,
    },
  });

  await prisma.follows.create({
    data: {
      followerId: user3.id,
      followingId: user1.id,
    },
  });

  await prisma.follows.create({
    data: {
      followerId: user1.id,
      followingId: user2.id,
    },
  });

  console.log('✅ Created follows');

  // Create sample messages
  await prisma.message.create({
    data: {
      senderId: user1.id,
      receiverId: user2.id,
      content: 'Hey Bob! How are you doing?',
    },
  });

  await prisma.message.create({
    data: {
      senderId: user2.id,
      receiverId: user1.id,
      content: 'Hi Alice! I\'m doing great, thanks for asking!',
      isRead: true,
    },
  });

  console.log('✅ Created messages');

  console.log('\n✅ Database seeded successfully!\n');
  console.log('📝 Test accounts created:');
  console.log('   - alice@example.com / password123');
  console.log('   - bob@example.com / password123');
  console.log('   - charlie@example.com / password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

