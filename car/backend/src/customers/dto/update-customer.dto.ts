import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateCustomerDto } from './create-customer.dto';

export class UpdateCustomerDto extends CreateCustomerDto {
  @ApiProperty({ example: 1, description: 'Customer ID' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  customerId: number;
}
