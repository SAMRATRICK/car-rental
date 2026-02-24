const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('Testing Email Configuration...\n');
  
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT) || 587;
  
  console.log('Configuration:');
  console.log(`  EMAIL_USER: ${emailUser}`);
  console.log(`  EMAIL_PASSWORD: ${emailPassword ? '***' + emailPassword.slice(-4) : 'NOT SET'}`);
  console.log(`  SMTP_HOST: ${smtpHost}`);
  console.log(`  SMTP_PORT: ${smtpPort}\n`);
  
  if (!emailUser || !emailPassword) {
    console.error('❌ EMAIL_USER or EMAIL_PASSWORD not set in .env file');
    process.exit(1);
  }
  
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false,
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  
  console.log('Verifying SMTP connection...');
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');
  } catch (error) {
    console.error('❌ SMTP connection failed:');
    console.error(`   ${error.message}\n`);
    process.exit(1);
  }
  
  console.log('Sending test email...');
  try {
    const info = await transporter.sendMail({
      from: `"Car Rental System" <${emailUser}>`,
      to: emailUser,
      subject: 'Test Email - Car Rental System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Test Email</h2>
          <p>This is a test email from Car Rental System.</p>
          <p>If you received this, your email configuration is working correctly!</p>
          <p>Test OTP: <strong>123456</strong></p>
        </div>
      `,
    });
    
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    console.log(`\nCheck your inbox at: ${emailUser}`);
  } catch (error) {
    console.error('❌ Failed to send test email:');
    console.error(`   ${error.message}`);
    process.exit(1);
  }
}

testEmail();
