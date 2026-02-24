import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';

@ApiTags('Vehicles')
@ApiBearerAuth()
@Controller()
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get('GetCars')
  @ApiOperation({ summary: 'Get all cars with optional pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async getCars(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.vehiclesService.findAll(page, pageSize);
  }

  @Post('CreateNewCar')
  @ApiOperation({ summary: 'Create a new car' })
  async createCar(@Body() createCarDto: CreateCarDto) {
    return this.vehiclesService.create(createCarDto);
  }

  @Put('UpdateCar')
  @ApiOperation({ summary: 'Update an existing car' })
  async updateCar(@Body() updateCarDto: UpdateCarDto) {
    return this.vehiclesService.update(updateCarDto);
  }

  @Delete('DeleteCarbyCarId/:id')
  @ApiOperation({ summary: 'Delete a car by ID' })
  async deleteCar(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.remove(id);
  }
}
