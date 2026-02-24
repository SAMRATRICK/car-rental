import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAdminEmail() {
  const newEmail = process.argv[2];
  
  if (!newEmail) {
    console.error('❌ Please provide an email address');
    console.log('Usage: npx ts-node update-admin-email.ts your-email@gmail.com');
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { username: 'samrat' },
      data: { email: newEmail },
    });

    console.log('✅ Admin email updated successfully!');
    console.log(`Username: ${user.username}`);
    console.log(`New Email: ${user.email}`);
    console.log('\nYou can now use this email for forgot password!');
  } catch (error) {
    console.error('❌ Error updating email:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminEmail();
