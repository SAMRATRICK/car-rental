const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixProfilePicturePaths() {
  console.log('🔧 Fixing profile picture paths in database...\n');

  try {
    // Get all users with profile pictures
    const users = await prisma.user.findMany({
      where: {
        profilePicture: {
          not: null,
        },
      },
      select: {
        id: true,
        username: true,
        profilePicture: true,
      },
    });

    console.log(`Found ${users.length} users with profile pictures\n`);

    let updatedCount = 0;

    for (const user of users) {
      const oldPath = user.profilePicture;
      
      // Skip if it's already in correct format or is an external URL
      if (!oldPath || 
          oldPath.startsWith('http://') || 
          oldPath.startsWith('https://') ||
          (!oldPath.startsWith('/uploads') && oldPath.startsWith('uploads'))) {
        console.log(`✓ ${user.username}: Already in correct format - ${oldPath}`);
        continue;
      }

      // Remove leading slash if present
      let newPath = oldPath;
      if (oldPath.startsWith('/uploads')) {
        newPath = oldPath.substring(1); // Remove leading slash
      }

      if (newPath !== oldPath) {
        await prisma.user.update({
          where: { id: user.id },
          data: { profilePicture: newPath },
        });

        console.log(`✅ ${user.username}:`);
        console.log(`   Old: ${oldPath}`);
        console.log(`   New: ${newPath}\n`);
        updatedCount++;
      }
    }

    console.log(`\n✅ Fixed ${updatedCount} profile picture paths`);
    console.log(`✓ ${users.length - updatedCount} paths were already correct`);

  } catch (error) {
    console.error('❌ Error fixing profile picture paths:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProfilePicturePaths();
