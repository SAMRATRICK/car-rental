import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateBookingDto } from './create-booking.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @ApiProperty({ example: 1, description: 'Booking ID' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  bookingId: number;
}
