import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForgotPasswordDto, VerifyOtpDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { RequestEmailChangeDto, VerifyEmailOtpDto, ChangeEmailDto } from './dto/change-email.dto';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  private otpStore = new Map<string, { otp: string; expiresAt: Date; email: string }>();
  private emailChangeOtpStore = new Map<number, { otp: string; expiresAt: Date; currentEmail: string }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, fullName, email, password } = registerDto;

    // Check if username already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Check if email already exists
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        username,
        fullName,
        email,
        password: hashedPassword,
        role: registerDto.role || 'admin',
      },
    });

    return {
      result: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    console.log(`\n🔐 Login attempt for username: ${username}`);
    console.log(`   Password received: "${password}"`);
    console.log(`   Password length: ${password.length}`);
    console.log(`   Password type: ${typeof password}`);

    // Check for whitespace issues
    if (password !== password.trim()) {
      console.log(`   ⚠️  WARNING: Password has leading/trailing whitespace!`);
      console.log(`   Original length: ${password.length}`);
      console.log(`   Trimmed length: ${password.trim().length}`);
    }

    // Find user by username
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      console.log(`   ❌ User not found`);
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log(`   ✓ User found: ${user.email}`);
    console.log(`   Stored password hash: ${user.password.substring(0, 20)}...`);

    // Try with original password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`   Password valid (original): ${isPasswordValid}`);

    // If original fails, try trimmed
    if (!isPasswordValid) {
      const trimmedPassword = password.trim();
      const isTrimmedValid = await bcrypt.compare(trimmedPassword, user.password);
      console.log(`   Password valid (trimmed): ${isTrimmedValid}`);
      
      if (isTrimmedValid) {
        console.log(`   ⚠️  Password worked after trimming! Frontend may be sending extra whitespace.`);
      }
    }

    if (!isPasswordValid) {
      console.log(`   ❌ Password mismatch`);
      console.log(`   💡 Tip: Make sure you're using the exact password you set during reset.`);
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log(`   ✅ Login successful`);

    // Generate JWT token
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      result: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
    };
  }

  async validateUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        profilePicture: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        profilePicture: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    console.log('\n👤 Get Profile:');
    console.log('   User ID:', userId);
    console.log('   Username:', user.username);
    console.log('   Profile Picture from DB:', user.profilePicture);

    return {
      result: true,
      data: user,
    };
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    // Check if email is being updated and if it's already taken
    if (updateProfileDto.email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: {
          email: updateProfileDto.email,
          NOT: { id: userId },
        },
      });

      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    console.log('\n💾 Updating profile in database:');
    console.log('   User ID:', userId);
    console.log('   Update data:', updateProfileDto);

    // If a new profile picture is being uploaded, delete the old one
    if (updateProfileDto.profilePicture) {
      const currentUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { profilePicture: true },
      });

      if (currentUser?.profilePicture) {
        const fs = require('fs');
        const path = require('path');
        const oldFilePath = path.join(process.cwd(), currentUser.profilePicture);
        
        console.log('   🗑️  Deleting old profile picture:', oldFilePath);
        
        // Delete old file if it exists
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
            console.log('   ✅ Old profile picture deleted');
          } catch (error) {
            console.log('   ⚠️  Failed to delete old profile picture:', error.message);
          }
        }
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        profilePicture: true,
        role: true,
      },
    });

    console.log('   ✅ Profile updated successfully');
    console.log('   New profile picture:', updatedUser.profilePicture);

    return {
      result: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { username, email } = forgotPasswordDto;

    console.log(`\n🔐 Secure Forgot Password Request:`);
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);

    // CRITICAL SECURITY: Validate username exists
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      console.log(`   ❌ SECURITY: Username not found: ${username}`);
      throw new BadRequestException('Invalid Username or Gmail ID');
    }

    console.log(`   ✅ Username found: ${user.username}`);
    console.log(`   Registered email: ${user.email}`);

    // CRITICAL SECURITY: Validate email matches the username
    if (!user.email || user.email.toLowerCase() !== email.toLowerCase()) {
      console.log(`   ❌ SECURITY: Email mismatch!`);
      console.log(`   Provided: ${email}`);
      console.log(`   Expected: ${user.email}`);
      throw new BadRequestException('Invalid Username or Gmail ID');
    }

    console.log(`   ✅ SECURITY: Username and Email validated successfully`);
    console.log(`   ✅ Proceeding with OTP generation`);

    // Check if there's an existing OTP for this username
    const existingOtp = this.otpStore.get(username);
    if (existingOtp) {
      console.log(`   ⚠️  Existing OTP found, will be replaced`);
      console.log(`   Old OTP: ${existingOtp.otp} (This OTP is now INVALID)`);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with 10 minutes expiration (keyed by username)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    this.otpStore.set(username, { otp, expiresAt, email: user.email });

    console.log(`\n🔐 NEW OTP Generated for ${username}:`);
    console.log(`   ✨ OTP: ${otp} ✨`);
    console.log(`   Expires at: ${expiresAt.toISOString()}`);
    console.log(`   Will be sent to: ${user.email}`);
    console.log(`   Current OTP Store size: ${this.otpStore.size}`);

    // Send OTP via email
    await this.emailService.sendOtpEmail(user.email, otp);

    return {
      result: true,
      message: 'OTP sent to your registered email successfully.',
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { username, otp } = verifyOtpDto;

    console.log(`\n🔍 Verifying OTP for username: ${username}`);
    console.log(`   Received OTP: "${otp}"`);
    console.log(`   Current OTP Store size: ${this.otpStore.size}`);

    const storedOtpData = this.otpStore.get(username);

    if (!storedOtpData) {
      console.log(`   ❌ No OTP found in store for this username`);
      throw new BadRequestException('OTP not found or expired. Please request a new OTP.');
    }

    console.log(`   Stored OTP: "${storedOtpData.otp}"`);
    console.log(`   Expires at: ${storedOtpData.expiresAt.toISOString()}`);
    console.log(`   Current time: ${new Date().toISOString()}`);

    if (new Date() > storedOtpData.expiresAt) {
      console.log(`   ❌ OTP has expired`);
      this.otpStore.delete(username);
      throw new BadRequestException('OTP has expired. Please request a new OTP.');
    }

    // Trim whitespace and compare
    const receivedOtp = otp.toString().trim();
    const storedOtp = storedOtpData.otp.toString().trim();

    console.log(`   Trimmed Received OTP: "${receivedOtp}"`);
    console.log(`   Trimmed Stored OTP: "${storedOtp}"`);
    console.log(`   Match: ${receivedOtp === storedOtp}`);

    if (receivedOtp !== storedOtp) {
      console.log(`   ❌ OTP mismatch`);
      throw new BadRequestException('Invalid OTP');
    }

    console.log(`   ✅ OTP verified successfully`);

    return {
      result: true,
      message: 'OTP verified successfully',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { username, otp, newPassword } = resetPasswordDto;

    console.log(`\n🔄 Resetting password for username: ${username}`);
    console.log(`   Received OTP: "${otp}"`);
    console.log(`   New password length: ${newPassword.length}`);

    // Check for whitespace issues
    if (newPassword !== newPassword.trim()) {
      console.log(`   ⚠️  WARNING: Password has leading/trailing whitespace!`);
    }

    // Verify OTP first
    const storedOtpData = this.otpStore.get(username);

    if (!storedOtpData) {
      console.log(`   ❌ No OTP found in store`);
      throw new BadRequestException('OTP not found or expired. Please request a new OTP.');
    }

    console.log(`   Stored OTP: "${storedOtpData.otp}"`);

    if (new Date() > storedOtpData.expiresAt) {
      console.log(`   ❌ OTP has expired`);
      this.otpStore.delete(username);
      throw new BadRequestException('OTP has expired. Please request a new OTP.');
    }

    // Trim whitespace and compare
    const receivedOtp = otp.toString().trim();
    const storedOtp = storedOtpData.otp.toString().trim();

    if (receivedOtp !== storedOtp) {
      console.log(`   ❌ OTP mismatch`);
      throw new BadRequestException('Invalid OTP');
    }

    console.log(`   ✅ OTP verified, updating password`);

    // Trim the password to avoid whitespace issues
    const cleanPassword = newPassword.trim();

    // Validate password strength
    if (cleanPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    // Get user info before update
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, email: true, password: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    console.log(`   User found: ${user.username} (${user.email})`);

    // Update user password
    await this.prisma.user.update({
      where: { username },
      data: { password: hashedPassword },
    });

    // Verify the update
    const updatedUser = await this.prisma.user.findUnique({
      where: { username },
      select: { password: true, username: true },
    });

    // Test the new password immediately
    const testLogin = await bcrypt.compare(cleanPassword, updatedUser.password);
    console.log(`   🧪 Test login with new password: ${testLogin ? '✅ WORKS' : '❌ FAILS'}`);

    // Clear OTP from store
    this.otpStore.delete(username);

    console.log(`   ✅ Password reset successfully`);
    console.log(`\n   📝 You can now login with:`);
    console.log(`      Username: ${updatedUser.username}`);
    console.log(`      Password: ${cleanPassword}`);

    return {
      result: true,
      message: 'Password reset successfully. You can now login with your new password.',
    };
  }

  async requestEmailChange(userId: number, requestEmailChangeDto: RequestEmailChangeDto) {
    const { currentEmail } = requestEmailChangeDto;

    console.log(`\n📧 Email Change Request for user ID: ${userId}`);
    console.log(`   Current Email provided: ${currentEmail}`);

    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current email matches
    if (user.email.toLowerCase() !== currentEmail.toLowerCase()) {
      console.log(`   ❌ Email mismatch!`);
      console.log(`   Provided: ${currentEmail}`);
      console.log(`   Expected: ${user.email}`);
      throw new BadRequestException('Current email does not match');
    }

    console.log(`   ✅ Current email verified`);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with 10 minutes expiration
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    this.emailChangeOtpStore.set(userId, { otp, expiresAt, currentEmail: user.email });

    console.log(`   ✨ OTP Generated: ${otp}`);
    console.log(`   Expires at: ${expiresAt.toISOString()}`);

    // Send OTP via email
    await this.emailService.sendEmailChangeOtp(user.email, otp);

    return {
      result: true,
      message: 'OTP sent to your current email address',
    };
  }

  async verifyEmailChangeOtp(userId: number, verifyEmailOtpDto: VerifyEmailOtpDto) {
    const { otp } = verifyEmailOtpDto;

    console.log(`\n🔍 Verifying Email Change OTP for user ID: ${userId}`);
    console.log(`   Received OTP: "${otp}"`);

    const storedOtpData = this.emailChangeOtpStore.get(userId);

    if (!storedOtpData) {
      console.log(`   ❌ No OTP found for this user`);
      throw new BadRequestException('OTP not found or expired. Please request a new OTP.');
    }

    console.log(`   Stored OTP: "${storedOtpData.otp}"`);

    if (new Date() > storedOtpData.expiresAt) {
      console.log(`   ❌ OTP has expired`);
      this.emailChangeOtpStore.delete(userId);
      throw new BadRequestException('OTP has expired. Please request a new OTP.');
    }

    const receivedOtp = otp.toString().trim();
    const storedOtp = storedOtpData.otp.toString().trim();

    if (receivedOtp !== storedOtp) {
      console.log(`   ❌ OTP mismatch`);
      throw new BadRequestException('Invalid OTP');
    }

    console.log(`   ✅ OTP verified successfully`);

    return {
      result: true,
      message: 'OTP verified successfully. You can now enter your new email.',
    };
  }

  async changeEmail(userId: number, changeEmailDto: ChangeEmailDto) {
    const { otp, newEmail } = changeEmailDto;

    console.log(`\n📧 Changing email for user ID: ${userId}`);
    console.log(`   New Email: ${newEmail}`);

    // Verify OTP again
    const storedOtpData = this.emailChangeOtpStore.get(userId);

    if (!storedOtpData) {
      console.log(`   ❌ No OTP found`);
      throw new BadRequestException('OTP not found or expired. Please request a new OTP.');
    }

    if (new Date() > storedOtpData.expiresAt) {
      console.log(`   ❌ OTP has expired`);
      this.emailChangeOtpStore.delete(userId);
      throw new BadRequestException('OTP has expired. Please request a new OTP.');
    }

    const receivedOtp = otp.toString().trim();
    const storedOtp = storedOtpData.otp.toString().trim();

    if (receivedOtp !== storedOtp) {
      console.log(`   ❌ OTP mismatch`);
      throw new BadRequestException('Invalid OTP');
    }

    // Check if new email is already taken
    const existingEmail = await this.prisma.user.findFirst({
      where: {
        email: newEmail,
        NOT: { id: userId },
      },
    });

    if (existingEmail) {
      console.log(`   ❌ Email already in use`);
      throw new ConflictException('This email is already registered to another account');
    }

    // Update email
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        profilePicture: true,
        role: true,
      },
    });

    // Clear OTP
    this.emailChangeOtpStore.delete(userId);

    console.log(`   ✅ Email changed successfully to: ${newEmail}`);

    return {
      result: true,
      message: 'Email changed successfully',
      data: updatedUser,
    };
  }
}
