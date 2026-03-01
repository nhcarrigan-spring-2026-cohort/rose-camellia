#!/bin/bash
echo "Resetting test database..."

# Delete test users and their data
node << 'NODESCRIPT'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reset() {
  try {
    // Delete test data
    await prisma.comments.deleteMany({});
    await prisma.imageUrls.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: { contains: 'example.com' } },
          { username: { startsWith: 'guest_' } }
        ]
      }
    });
    console.log('✓ Test data cleared');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

reset();
NODESCRIPT
