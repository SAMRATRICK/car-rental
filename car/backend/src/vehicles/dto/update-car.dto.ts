import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateCarDto } from './create-car.dto';

export class UpdateCarDto extends CreateCarDto {
  @ApiProperty({ example: 1, description: 'Car ID' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  carId: number;
}
