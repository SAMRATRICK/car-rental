import { IsOptional, IsInt, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterBookingsDto {
  @ApiPropertyOptional({ example: 1, description: 'Customer ID' })
  @IsOptional()
  @IsInt()
  customerId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Car ID' })
  @IsOptional()
  @IsInt()
  carId?: number;

  @ApiPropertyOptional({
    example: '2024-01-01',
    description: 'Start date',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2024-12-31',
    description: 'End date',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
