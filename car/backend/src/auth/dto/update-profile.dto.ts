import { IsString, IsEmail, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name', required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number (numbers only)', required: false })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9+\-\s()]*$/, { message: 'Phone number can only contain numbers and phone formatting characters (+, -, spaces, parentheses)' })
  phone?: string;

  @ApiProperty({ example: 'uploads/profile-pictures/profile-123.jpg', description: 'Profile picture path', required: false })
  @IsString()
  @IsOptional()
  profilePicture?: string;
}
