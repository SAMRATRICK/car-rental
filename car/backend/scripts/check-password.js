const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function checkPassword() {
  try {
    // Get the user
    const user = await prisma.user.findFirst({
      where: { username: 'samrat' }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('\n📊 User Information:');
    console.log('   Username:', user.username);
    console.log('   Email:', user.email);
    console.log('   Password Hash:', user.password.substring(0, 30) + '...');
    console.log('   Full Hash Length:', user.password.length);

    // Test the password
    const testPassword = '88889999';
    console.log('\n🔐 Testing password:', testPassword);
    
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log('   Result:', isValid ? '✅ VALID' : '❌ INVALID');

    if (!isValid) {
      console.log('\n💡 The password in the database does not match "88889999"');
      console.log('   This means the password reset may not have worked correctly.');
      
      // Let's hash the password and show what it should be
      const correctHash = await bcrypt.hash(testPassword, 10);
      console.log('\n   What the hash should look like:');
      console.log('   ', correctHash.substring(0, 30) + '...');
      
      // Update the password
      console.log('\n🔄 Updating password to "88889999"...');
      await prisma.user.update({
        where: { username: 'samrat' },
        data: { password: correctHash }
      });
      console.log('   ✅ Password updated successfully!');
      
      // Verify the update
      const updatedUser = await prisma.user.findFirst({
        where: { username: 'samrat' }
      });
      const isNowValid = await bcrypt.compare(testPassword, updatedUser.password);
      console.log('   Verification:', isNowValid ? '✅ Password now works!' : '❌ Still not working');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPassword();
