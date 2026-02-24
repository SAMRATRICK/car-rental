import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestEmailChangeDto {
  @ApiProperty({ example: 'john@example.com', description: 'Current email address' })
  @IsEmail()
  @IsNotEmpty()
  currentEmail: string;
}

export class VerifyEmailOtpDto {
  @ApiProperty({ example: '123456', description: '6-digit OTP' })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class ChangeEmailDto {
  @ApiProperty({ example: '123456', description: '6-digit OTP' })
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty({ example: 'newemail@example.com', description: 'New email address' })
  @IsEmail()
  @IsNotEmpty()
  newEmail: string;
}
