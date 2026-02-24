import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ example: 'John Doe', description: 'Customer name' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: 'Mumbai', description: 'Customer city' })
  @IsString()
  @IsNotEmpty()
  customerCity: string;

  @ApiProperty({
    example: '+91-9876543210',
    description: 'Mobile number',
  })
  @IsString()
  @IsNotEmpty()
  mobileNo: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
