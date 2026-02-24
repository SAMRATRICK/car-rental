const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateProfilePictures() {
  try {
    console.log('🔄 Updating profile pictures to use personalized avatars...\n');

    const users = await prisma.user.findMany();

    for (const user of users) {
      // Generate a personalized avatar URL based on their name
      const displayName = user.fullName || user.username || 'User';
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4F46E5&color=fff&size=150`;

      await prisma.user.update({
        where: { id: user.id },
        data: { profilePicture: avatarUrl }
      });

      console.log(`✅ Updated ${user.username}: ${avatarUrl}`);
    }

    console.log(`\n✅ Updated ${users.length} user(s) successfully!`);
    console.log('\nNow each user has a consistent avatar based on their name.');
    console.log('The avatar will stay the same until they upload a custom image.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateProfilePictures();
