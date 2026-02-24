const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteAllUsers() {
  try {
    console.log('⚠️  Deleting ALL users from the database...');
    console.log('');

    const result = await prisma.user.deleteMany({});
    
    console.log(`✅ Deleted ${result.count} user(s) successfully!`);
    console.log('');
    console.log('You can now register new users with the same email addresses.');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllUsers();
