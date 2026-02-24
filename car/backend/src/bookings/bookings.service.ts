import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { FilterBookingsDto } from './dto/filter-bookings.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const bookings = await this.prisma.booking.findMany({
      include: {
        car: true,
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map id to bookingId and car.id to carId for frontend compatibility
    const mappedBookings = bookings.map(booking => ({
      ...booking,
      bookingId: booking.id,
      carId: booking.car.id,
      car: {
        ...booking.car,
        carId: booking.car.id
      }
    }));

    return {
      result: true,
      message: 'Bookings retrieved successfully',
      data: mappedBookings,
    };
  }

  async findOne(id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        car: true,
        customer: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // Map id to bookingId and car.id to carId for frontend compatibility
    const mappedBooking = {
      ...booking,
      bookingId: booking.id,
      carId: booking.car.id,
      car: {
        ...booking.car,
        carId: booking.car.id
      }
    };

    return {
      result: true,
      message: 'Booking retrieved successfully',
      data: mappedBooking,
    };
  }

  async findByCustomerId(customerId: number) {
    const bookings = await this.prisma.booking.findMany({
      where: { customerId },
      include: {
        car: true,
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map id to bookingId and car.id to carId for frontend compatibility
    const mappedBookings = bookings.map(booking => ({
      ...booking,
      bookingId: booking.id,
      carId: booking.car.id,
      car: {
        ...booking.car,
        carId: booking.car.id
      }
    }));

    return {
      result: true,
      message: 'Bookings retrieved successfully',
      data: mappedBookings,
    };
  }

  async create(createBookingDto: CreateBookingDto) {
    // Verify car exists
    const car = await this.prisma.car.findUnique({
      where: { id: createBookingDto.carId },
    });

    if (!car) {
      throw new NotFoundException(
        `Car with ID ${createBookingDto.carId} not found`,
      );
    }

    // If customer info provided, try to find or create customer
    let customerId = createBookingDto.customerId;

    if (!customerId && createBookingDto.email) {
      // Try to find existing customer by email
      let customer = await this.prisma.customer.findUnique({
        where: { email: createBookingDto.email },
      });

      // If customer doesn't exist, create new one
      if (!customer) {
        customer = await this.prisma.customer.create({
          data: {
            customerName: createBookingDto.customerName,
            customerCity: createBookingDto.customerCity,
            mobileNo: createBookingDto.mobileNo,
            email: createBookingDto.email,
          },
        });
      }

      customerId = customer.id;
    }

    if (!customerId) {
      throw new NotFoundException('Customer information is required');
    }

    // Create booking
    const booking = await this.prisma.booking.create({
      data: {
        customerId,
        carId: createBookingDto.carId,
        customerName: createBookingDto.customerName,
        customerCity: createBookingDto.customerCity,
        mobileNo: createBookingDto.mobileNo,
        email: createBookingDto.email,
        bookingDate: new Date(createBookingDto.bookingDate),
        discount: createBookingDto.discount || 0,
        totalBillAmount: createBookingDto.totalBillAmount,
      },
      include: {
        car: true,
        customer: true,
      },
    });

    // Map id to bookingId and car.id to carId for frontend compatibility
    const mappedBooking = {
      ...booking,
      bookingId: booking.id,
      carId: booking.car.id,
      car: {
        ...booking.car,
        carId: booking.car.id
      }
    };

    return {
      result: true,
      message: 'Booking created successfully',
      data: mappedBooking,
    };
  }

  async update(updateBookingDto: UpdateBookingDto) {
    const { bookingId, ...data } = updateBookingDto;

    // Check if booking exists
    const existingBooking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!existingBooking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    // Verify car exists if carId is being updated
    if (data.carId) {
      const car = await this.prisma.car.findUnique({
        where: { id: data.carId },
      });

      if (!car) {
        throw new NotFoundException(`Car with ID ${data.carId} not found`);
      }
    }

    const booking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        ...data,
        bookingDate: data.bookingDate
          ? new Date(data.bookingDate)
          : undefined,
      },
      include: {
        car: true,
        customer: true,
      },
    });

    // Map id to bookingId and car.id to carId for frontend compatibility
    const mappedBooking = {
      ...booking,
      bookingId: booking.id,
      carId: booking.car.id,
      car: {
        ...booking.car,
        carId: booking.car.id
      }
    };

    return {
      result: true,
      message: 'Booking updated successfully',
      data: mappedBooking,
    };
  }

  async remove(id: number) {
    // Check if booking exists
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    await this.prisma.booking.delete({
      where: { id },
    });

    return {
      result: true,
      message: 'Booking deleted successfully',
      data: null,
    };
  }

  async filter(filterBookingsDto: FilterBookingsDto) {
    const where: any = {};

    if (filterBookingsDto.customerId) {
      where.customerId = filterBookingsDto.customerId;
    }

    if (filterBookingsDto.carId) {
      where.carId = filterBookingsDto.carId;
    }

    if (filterBookingsDto.startDate || filterBookingsDto.endDate) {
      where.bookingDate = {};

      if (filterBookingsDto.startDate) {
        where.bookingDate.gte = new Date(filterBookingsDto.startDate);
      }

      if (filterBookingsDto.endDate) {
        where.bookingDate.lte = new Date(filterBookingsDto.endDate);
      }
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      include: {
        car: true,
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map id to bookingId and car.id to carId for frontend compatibility
    const mappedBookings = bookings.map(booking => ({
      ...booking,
      bookingId: booking.id,
      carId: booking.car.id,
      car: {
        ...booking.car,
        carId: booking.car.id
      }
    }));

    return {
      result: true,
      message: 'Bookings filtered successfully',
      data: mappedBookings,
    };
  }
}
