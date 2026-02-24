const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function syncProfilePictures() {
  try {
    console.log('\n🔄 Syncing Profile Pictures...\n');
    
    // Get all users with profile pictures
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        profilePicture: true,
      },
    });

    const uploadsDir = path.join(__dirname, '..', 'uploads', 'profile-pictures');
    
    // Get all files in uploads directory
    const files = fs.readdirSync(uploadsDir)
      .filter(f => f.startsWith('profile-') && f.endsWith('.jpg'));
    
    console.log(`📁 Found ${files.length} uploaded files`);
    console.log(`👥 Found ${users.length} users\n`);

    for (const user of users) {
      console.log(`\n👤 User: ${user.username} (ID: ${user.id})`);
      console.log(`   Current DB path: ${user.profilePicture}`);
      
      // Skip if it's an external URL
      if (user.profilePicture && (user.profilePicture.startsWith('http://') || user.profilePicture.startsWith('https://'))) {
        console.log(`   ✅ External URL - skipping`);
        continue;
      }
      
      // Check if the file exists
      if (user.profilePicture && user.profilePicture.startsWith('uploads/')) {
        const filename = path.basename(user.profilePicture);
        const filePath = path.join(uploadsDir, filename);
        
        if (fs.existsSync(filePath)) {
          console.log(`   ✅ File exists on disk`);
        } else {
          console.log(`   ❌ File NOT found on disk: ${filename}`);
          
          // Try to find a file for this user
          if (files.length > 0) {
            const newFile = files[0]; // Use the first available file
            const newPath = `uploads/profile-pictures/${newFile}`;
            
            console.log(`   🔧 Updating to: ${newPath}`);
            
            await prisma.user.update({
              where: { id: user.id },
              data: { profilePicture: newPath },
            });
            
            console.log(`   ✅ Updated successfully`);
            files.shift(); // Remove the used file from the list
          } else {
            console.log(`   ⚠️  No available files to assign`);
          }
        }
      } else {
        console.log(`   ℹ️  No local profile picture set`);
      }
    }

    console.log('\n✅ Sync complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

syncProfilePictures();
