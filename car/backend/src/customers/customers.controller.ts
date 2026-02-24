import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('Customers')
@ApiBearerAuth()
@Controller()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('GetCustomers')
  @ApiOperation({ summary: 'Get all customers' })
  async getCustomers() {
    return this.customersService.findAll();
  }

  @Post('CreateNewCustomer')
  @ApiOperation({ summary: 'Create a new customer' })
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Put('UpdateCustomer')
  @ApiOperation({ summary: 'Update an existing customer' })
  async updateCustomer(@Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(updateCustomerDto);
  }

  @Delete('DeletCustomerById/:id')
  @ApiOperation({ summary: 'Delete a customer by ID' })
  async deleteCustomer(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.remove(id);
  }
}
