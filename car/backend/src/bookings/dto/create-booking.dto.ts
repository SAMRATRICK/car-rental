import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsNumber,
  IsPositive,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @ApiPropertyOptional({ example: 1, description: 'Customer ID (optional)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  customerId?: number;

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

  @ApiProperty({ example: 1, description: 'Car ID' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  carId: number;

  @ApiProperty({
    example: '2024-02-15T10:00:00Z',
    description: 'Booking date',
  })
  @IsDateString()
  @IsNotEmpty()
  bookingDate: string;

  @ApiPropertyOptional({ example: 0, description: 'Discount amount' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiProperty({ example: 7500.0, description: 'Total bill amount' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  totalBillAmount: number;
}
