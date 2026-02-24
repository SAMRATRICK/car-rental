const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function fixPassword() {
  try {
    console.log('\n🔧 Password Fix Utility\n');
    console.log('=' .repeat(60));

    // Get current user
    const user = await prisma.user.findFirst({
      where: { username: 'samrat' }
    });

    if (!user) {
      console.log('❌ User "samrat" not found');
      return;
    }

    console.log('\n📊 Current User:');
    console.log('   Username:', user.username);
    console.log('   Email:', user.email);
    console.log('   Current Hash:', user.password.substring(0, 30) + '...');

    // Ask what password to set
    console.log('\n');
    const newPassword = await question('Enter the password you want to set: ');
    
    if (!newPassword || newPassword.trim().length === 0) {
      console.log('❌ Password cannot be empty');
      return;
    }

    const cleanPassword = newPassword.trim();
    
    if (newPassword !== cleanPassword) {
      console.log(`\n⚠️  WARNING: Your password had whitespace!`);
      console.log(`   Original: "${newPassword}" (length: ${newPassword.length})`);
      console.log(`   Cleaned: "${cleanPassword}" (length: ${cleanPassword.length})`);
      console.log(`   Using cleaned version...`);
    }

    console.log(`\n🔄 Setting password to: "${cleanPassword}"`);
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(cleanPassword, 10);
    console.log('   Hash generated:', hashedPassword.substring(0, 30) + '...');

    // Update in database
    await prisma.user.update({
      where: { username: 'samrat' },
      data: { password: hashedPassword }
    });

    console.log('   ✅ Password updated in database');

    // Verify it works
    const updatedUser = await prisma.user.findFirst({
      where: { username: 'samrat' }
    });

    const testResult = await bcrypt.compare(cleanPassword, updatedUser.password);
    
    console.log('\n✅ Verification:');
    console.log('   Password test:', testResult ? '✅ WORKS!' : '❌ FAILED!');

    if (testResult) {
      console.log('\n📝 Login Credentials:');
      console.log('   ╔════════════════════════════════════════╗');
      console.log(`   ║ Username: samrat                       ║`);
      console.log(`   ║ Password: ${cleanPassword.padEnd(30, ' ')}║`);
      console.log('   ╚════════════════════════════════════════╝');
      console.log('\n   Use these EXACT credentials to login.');
      console.log('   Make sure there are NO extra spaces when typing!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

fixPassword();
