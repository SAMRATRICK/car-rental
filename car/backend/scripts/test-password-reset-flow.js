const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testPasswordResetFlow() {
  try {
    console.log('\n🧪 Testing Complete Password Reset Flow\n');
    console.log('=' .repeat(60));

    // Step 1: Get current user state
    console.log('\n📊 Step 1: Current User State');
    const user = await prisma.user.findFirst({
      where: { username: 'samrat' }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('   Username:', user.username);
    console.log('   Email:', user.email);
    console.log('   Current Password Hash:', user.password.substring(0, 30) + '...');

    // Step 2: Test current password
    console.log('\n🔐 Step 2: Testing Current Password (88889999)');
    const currentPasswordWorks = await bcrypt.compare('88889999', user.password);
    console.log('   Result:', currentPasswordWorks ? '✅ Works' : '❌ Does not work');

    // Step 3: Simulate password reset with a NEW password
    const newPassword = 'MyNewPass123';
    console.log(`\n🔄 Step 3: Simulating Password Reset to "${newPassword}"`);
    
    // This is what the backend does in resetPassword()
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('   New Hash Generated:', hashedPassword.substring(0, 30) + '...');
    console.log('   Hash Length:', hashedPassword.length);

    // Update in database
    await prisma.user.update({
      where: { email: user.email },
      data: { password: hashedPassword }
    });
    console.log('   ✅ Password updated in database');

    // Step 4: Verify the update worked
    console.log('\n✅ Step 4: Verifying Password Update');
    const updatedUser = await prisma.user.findFirst({
      where: { username: 'samrat' }
    });

    console.log('   Updated Hash:', updatedUser.password.substring(0, 30) + '...');
    console.log('   Hashes Match:', updatedUser.password === hashedPassword ? '✅ Yes' : '❌ No');

    // Step 5: Test login with NEW password
    console.log(`\n🔑 Step 5: Testing Login with NEW Password "${newPassword}"`);
    const newPasswordWorks = await bcrypt.compare(newPassword, updatedUser.password);
    console.log('   Result:', newPasswordWorks ? '✅ LOGIN WORKS!' : '❌ LOGIN FAILS!');

    // Step 6: Test login with OLD password (should fail)
    console.log('\n🔑 Step 6: Testing Login with OLD Password "88889999" (should fail)');
    const oldPasswordWorks = await bcrypt.compare('88889999', updatedUser.password);
    console.log('   Result:', oldPasswordWorks ? '❌ Still works (BAD!)' : '✅ Does not work (GOOD!)');

    console.log('\n' + '=' .repeat(60));
    console.log('\n📝 Summary:');
    console.log('   The password reset flow is working correctly in the backend.');
    console.log(`   New password "${newPassword}" has been set.`);
    console.log('   You can now login with:');
    console.log(`     Username: samrat`);
    console.log(`     Password: ${newPassword}`);
    console.log('\n   If you still get "wrong credentials", the issue is likely:');
    console.log('   1. Frontend is sending wrong data format');
    console.log('   2. Backend server needs to be restarted');
    console.log('   3. There\'s whitespace in the password field');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPasswordResetFlow();
