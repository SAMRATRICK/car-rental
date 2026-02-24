const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function showUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      }
    });

    console.log('\n📊 All Users in Database:\n');
    console.log('=' .repeat(70));
    users.forEach(user => {
      console.log(`ID: ${user.id} | Username: ${user.username} | Email: ${user.email} | Role: ${user.role}`);
    });
    console.log('=' .repeat(70));
    console.log(`\nTotal users: ${users.length}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

showUsers();
