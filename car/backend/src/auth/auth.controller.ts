import { Controller, Post, Body, Get, Put, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForgotPasswordDto, VerifyOtpDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { RequestEmailChangeDto, VerifyEmailOtpDto, ChangeEmailDto } from './dto/change-email.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

// Multer configuration for file uploads
const storage = diskStorage({
  destination: './uploads/profile-pictures',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `profile-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: any, callback: any) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
    return callback(new BadRequestException('Only image files are allowed!'), false);
  }
  callback(null, true);
};

@ApiTags('Authentication')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    console.log('\n📥 Controller received login request:');
    console.log('   Username:', loginDto.username);
    console.log('   Password length:', loginDto.password?.length);
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Bad request - user already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset OTP with username and email validation' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid username or email' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    console.log('\n📥 Controller received forgot-password request:');
    console.log('   Username:', forgotPasswordDto.username);
    console.log('   Email:', forgotPasswordDto.email);
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    console.log('\n📥 Controller received verify-otp request:');
    console.log('   Username:', verifyOtpDto.username);
    console.log('   OTP:', verifyOtpDto.otp);
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with OTP' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    console.log('\n📥 Controller received reset-password request:');
    console.log('   Username:', resetPasswordDto.username);
    console.log('   OTP:', resetPasswordDto.otp);
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('profilePicture', {
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  }))
  async updateProfile(
    @Request() req, 
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    console.log('\n📸 Profile Update Request:');
    console.log('   User ID:', req.user.id);
    console.log('   File uploaded:', !!file);
    
    // If file is uploaded, add the file path to the update data
    if (file) {
      // Store relative path that matches static file serving configuration
      const fileUrl = `uploads/profile-pictures/${file.filename}`;
      updateProfileDto.profilePicture = fileUrl;
      console.log('   File saved as:', file.filename);
      console.log('   Storing in DB:', fileUrl);
    }
    
    console.log('   Update data:', updateProfileDto);
    
    return this.authService.updateProfile(req.user.id, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('request-email-change')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request email change with OTP' })
  @ApiResponse({ status: 200, description: 'OTP sent to current email' })
  async requestEmailChange(@Request() req, @Body() requestEmailChangeDto: RequestEmailChangeDto) {
    return this.authService.requestEmailChange(req.user.id, requestEmailChangeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-email-otp')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify email change OTP' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  async verifyEmailOtp(@Request() req, @Body() verifyEmailOtpDto: VerifyEmailOtpDto) {
    return this.authService.verifyEmailChangeOtp(req.user.id, verifyEmailOtpDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-email')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change email with verified OTP' })
  @ApiResponse({ status: 200, description: 'Email changed successfully' })
  async changeEmail(@Request() req, @Body() changeEmailDto: ChangeEmailDto) {
    return this.authService.changeEmail(req.user.id, changeEmailDto);
  }
}
