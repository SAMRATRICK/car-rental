import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPassword = this.configService.get<string>('EMAIL_PASSWORD');
    const smtpHost = this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com';
    const smtpPort = this.configService.get<number>('SMTP_PORT') || 587;
    
    console.log('📧 Email Service Configuration:');
    console.log(`   EMAIL_USER: ${emailUser ? '✓ Set' : '✗ Not set'}`);
    console.log(`   EMAIL_PASSWORD: ${emailPassword ? '✓ Set' : '✗ Not set'}`);
    console.log(`   SMTP_HOST: ${smtpHost}`);
    console.log(`   SMTP_PORT: ${smtpPort}`);
    
    if (emailUser && emailPassword) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: false, // true for 465, false for other ports
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      
      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('❌ SMTP Connection Error:', error);
        } else {
          console.log('✅ SMTP Server is ready to send emails');
        }
      });
    } else {
      console.warn('⚠️  Email credentials not configured - emails will be logged to console');
    }
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    // If no email credentials configured, just log to console
    if (!this.transporter) {
      console.log('\n' + '='.repeat(60));
      console.log('📧 OTP EMAIL (Console Mode - No Email Credentials)');
      console.log('='.repeat(60));
      console.log(`To: ${email}`);
      console.log(`OTP Code: ${otp}`);
      console.log('='.repeat(60) + '\n');
      return;
    }

    console.log(`\n📤 Attempting to send OTP email to: ${email}`);
    console.log(`   🔑 OTP CODE: ${otp} (Copy this for testing)`);

    try {
      const mailOptions = {
        from: `"Car Rental System" <${this.configService.get<string>('EMAIL_USER')}>`,
        to: email,
        subject: 'Password Reset OTP - Car Rental System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>You have requested to reset your password for Car Rental System.</p>
            <p>Your OTP code is:</p>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
              ${otp}
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">© 2026 Car Rental System | Samrat Chatterjee</p>
          </div>
        `,
      };

      console.log(`   From: ${mailOptions.from}`);
      console.log(`   To: ${mailOptions.to}`);
      console.log(`   Subject: ${mailOptions.subject}`);

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ OTP email sent successfully!`);
      console.log(`   Message ID: ${info.messageId}`);
      console.log(`   Response: ${info.response}`);
      console.log(`   🔑 REMINDER - OTP: ${otp}\n`);
    } catch (error) {
      // If email fails, show OTP in console
      console.error('❌ Email sending failed with error:');
      console.error(`   Error Name: ${error.name}`);
      console.error(`   Error Message: ${error.message}`);
      if (error.code) console.error(`   Error Code: ${error.code}`);
      if (error.command) console.error(`   SMTP Command: ${error.command}`);
      
      console.log('\n' + '='.repeat(60));
      console.log('⚠️  EMAIL FAILED - Showing OTP in Console');
      console.log('='.repeat(60));
      console.log(`To: ${email}`);
      console.log(`OTP Code: ${otp}`);
      console.log('='.repeat(60) + '\n');
    }
  }

  async sendEmailChangeOtp(email: string, otp: string): Promise<void> {
    // If no email credentials configured, just log to console
    if (!this.transporter) {
      console.log('\n' + '='.repeat(60));
      console.log('📧 EMAIL CHANGE OTP (Console Mode - No Email Credentials)');
      console.log('='.repeat(60));
      console.log(`To: ${email}`);
      console.log(`OTP Code: ${otp}`);
      console.log('='.repeat(60) + '\n');
      return;
    }

    console.log(`\n📤 Attempting to send Email Change OTP to: ${email}`);
    console.log(`   🔑 OTP CODE: ${otp} (Copy this for testing)`);

    try {
      const mailOptions = {
        from: `"Car Rental System" <${this.configService.get<string>('EMAIL_USER')}>`,
        to: email,
        subject: 'Email Change Verification - Car Rental System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Change Request</h2>
            <p>You have requested to change your email address for Car Rental System.</p>
            <p>Your verification OTP code is:</p>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
              ${otp}
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email and your email address will remain unchanged.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">© 2026 Car Rental System | Samrat Chatterjee</p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email Change OTP sent successfully!`);
      console.log(`   Message ID: ${info.messageId}`);
      console.log(`   🔑 REMINDER - OTP: ${otp}\n`);
    } catch (error) {
      console.error('❌ Email sending failed with error:');
      console.error(`   Error Message: ${error.message}`);
      
      console.log('\n' + '='.repeat(60));
      console.log('⚠️  EMAIL FAILED - Showing OTP in Console');
      console.log('='.repeat(60));
      console.log(`To: ${email}`);
      console.log(`OTP Code: ${otp}`);
      console.log('='.repeat(60) + '\n');
    }
  }
}
