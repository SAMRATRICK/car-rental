const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function setPassword() {
  const newPassword = process.argv[2];
  
  if (!newPassword) {
    console.log('Usage: node set-password.js <password>');
    console.log('Example: node set-password.js test123');
    process.exit(1);
  }

  try {
    console.log('\n🔧 Setting Password\n');
    console.log('=' .repeat(60));

    const user = await prisma.user.findFirst({
      where: { username: 'samrat' }
    });

    if (!user) {
      console.log('❌ User "samrat" not found');
      return;
    }

    console.log('\n📊 User:', user.username, '(' + user.email + ')');
    
    const cleanPassword = newPassword.trim();
    console.log(`\n🔄 Setting password to: "${cleanPassword}"`);
    console.log(`   Length: ${cleanPassword.length} characters`);
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(cleanPassword, 10);
    console.log('   Hash:', hashedPassword.substring(0, 30) + '...');

    // Update in database
    await prisma.user.update({
      where: { username: 'samrat' },
      data: { password: hashedPassword }
    });

    console.log('   ✅ Updated in database');

    // Verify it works
    const updatedUser = await prisma.user.findFirst({
      where: { username: 'samrat' }
    });

    const testResult = await bcrypt.compare(cleanPassword, updatedUser.password);
    
    console.log('\n✅ Verification:', testResult ? 'WORKS!' : 'FAILED!');

    if (testResult) {
      console.log('\n' + '=' .repeat(60));
      console.log('📝 LOGIN CREDENTIALS:');
      console.log('=' .repeat(60));
      console.log(`Username: samrat`);
      console.log(`Password: ${cleanPassword}`);
      console.log('=' .repeat(60));
      console.log('\n✨ You can now login with these credentials!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setPassword();
