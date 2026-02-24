import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCarDto {
  @ApiProperty({ example: 'Toyota', description: 'Car brand' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ example: 'Camry', description: 'Car model' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ example: 2023, description: 'Manufacturing year' })
  @Type(() => Number)
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @ApiProperty({ example: 'Silver', description: 'Car color' })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({ example: 2500.0, description: 'Daily rental rate' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  dailyRate: number;

  @ApiProperty({
    example: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb',
    description: 'Car image URL',
  })
  @IsString()
  @IsNotEmpty()
  carImage: string;

  @ApiProperty({
    example: 'MH-01-AB-1234',
    description: 'Registration number',
  })
  @IsString()
  @IsNotEmpty()
  regNo: string;
}
