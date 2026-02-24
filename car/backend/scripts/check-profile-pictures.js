const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProfilePictures() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        profilePicture: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    console.log('\n📸 Profile Pictures in Database:\n');
    console.log('='.repeat(80));

    if (users.length === 0) {
      console.log('No users found');
    } else {
      users.forEach((user) => {
        console.log(`ID: ${user.id}`);
        console.log(`Username: ${user.username}`);
        console.log(`Full Name: ${user.fullName || '(not set)'}`);
        console.log(`Profile Picture: ${user.profilePicture || '(not set)'}`);
        console.log('-'.repeat(80));
      });
    }

    console.log(`\nTotal users: ${users.length}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProfilePictures();
