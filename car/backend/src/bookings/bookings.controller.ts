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
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { FilterBookingsDto } from './dto/filter-bookings.dto';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('geAllBookings')
  @ApiOperation({ summary: 'Get all bookings' })
  async getAllBookings() {
    return this.bookingsService.findAll();
  }

  @Get('GetBookingByBookingId/:id')
  @ApiOperation({ summary: 'Get booking by ID' })
  async getBookingById(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.findOne(id);
  }

  @Get('geAllBookingsByCustomerId/:id')
  @ApiOperation({ summary: 'Get all bookings by customer ID' })
  async getBookingsByCustomerId(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.findByCustomerId(id);
  }

  @Post('CreateNewBooking')
  @ApiOperation({ summary: 'Create a new booking' })
  async createBooking(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Put('UpdateBooking')
  @ApiOperation({ summary: 'Update an existing booking' })
  async updateBooking(@Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(updateBookingDto);
  }

  @Delete('DeletBookingById/:id')
  @ApiOperation({ summary: 'Delete a booking by ID' })
  async deleteBooking(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.remove(id);
  }

  @Post('FilterBookings')
  @ApiOperation({ summary: 'Filter bookings by criteria' })
  async filterBookings(@Body() filterBookingsDto: FilterBookingsDto) {
    return this.bookingsService.filter(filterBookingsDto);
  }
}
