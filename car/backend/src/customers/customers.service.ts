import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const customers = await this.prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Map id to customerId for frontend compatibility
    const mappedCustomers = customers.map(customer => ({
      ...customer,
      customerId: customer.id
    }));

    // Get chart data
    const chartData = await this.getCustomerChartData();

    return {
      result: true,
      message: 'Customers retrieved successfully',
      data: mappedCustomers,
      charts: chartData,
    };
  }

  private async getCustomerChartData() {
    // 1. Top 5 customers by spending
    const topCustomers = await this.getTopCustomersBySpending();

    // 2. Customer distribution by city
    const customersByCity = await this.getCustomersByCity();

    // 3. Customer spending trend (last 6 months)
    const spendingTrend = await this.getCustomerSpendingTrend();

    // 4. Bookings per customer
    const bookingsPerCustomer = await this.getBookingsPerCustomer();

    return {
      topCustomers,
      customersByCity,
      spendingTrend,
      bookingsPerCustomer,
    };
  }

  private async getTopCustomersBySpending() {
    const bookings = await this.prisma.booking.findMany({
      include: {
        customer: true,
      },
    });

    // Group by customer and sum spending
    const customerSpending: { [key: number]: { name: string; total: number } } = {};

    bookings.forEach((booking) => {
      const customerId = booking.customerId;
      if (!customerSpending[customerId]) {
        customerSpending[customerId] = {
          name: booking.customer.customerName,
          total: 0,
        };
      }
      customerSpending[customerId].total += Number(booking.totalBillAmount);
    });

    // Sort and get top 5
    const sorted = Object.values(customerSpending)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return sorted;
  }

  private async getCustomersByCity() {
    const customers = await this.prisma.customer.findMany();

    const cityCounts: { [key: string]: number } = {};

    customers.forEach((customer) => {
      const city = customer.customerCity;
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    return Object.entries(cityCounts).map(([city, count]) => ({
      city,
      count,
    }));
  }

  private async getCustomerSpendingTrend() {
    const last6Months = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);

      const bookings = await this.prisma.booking.findMany({
        where: {
          bookingDate: {
            gte: date,
            lt: nextMonth,
          },
        },
      });

      const totalSpent = bookings.reduce(
        (sum, booking) => sum + Number(booking.totalBillAmount),
        0,
      );

      last6Months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        spending: totalSpent,
      });
    }

    return last6Months;
  }

  private async getBookingsPerCustomer() {
    const bookings = await this.prisma.booking.findMany({
      include: {
        customer: true,
      },
    });

    const customerBookings: { [key: number]: { name: string; count: number } } = {};

    bookings.forEach((booking) => {
      const customerId = booking.customerId;
      if (!customerBookings[customerId]) {
        customerBookings[customerId] = {
          name: booking.customer.customerName,
          count: 0,
        };
      }
      customerBookings[customerId].count += 1;
    });

    // Sort and get top 10
    const sorted = Object.values(customerBookings)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return sorted;
  }

  async create(createCustomerDto: CreateCustomerDto) {
    try {
      const customer = await this.prisma.customer.create({
        data: createCustomerDto,
      });

      // Map id to customerId for frontend compatibility
      const mappedCustomer = {
        ...customer,
        customerId: customer.id
      };

      return {
        result: true,
        message: 'Customer added successfully',
        data: mappedCustomer,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'A customer with this email already exists',
        );
      }
      throw error;
    }
  }

  async update(updateCustomerDto: UpdateCustomerDto) {
    const { customerId, ...data } = updateCustomerDto;

    // Check if customer exists
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!existingCustomer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    try {
      const customer = await this.prisma.customer.update({
        where: { id: customerId },
        data,
      });

      // Map id to customerId for frontend compatibility
      const mappedCustomer = {
        ...customer,
        customerId: customer.id
      };

      return {
        result: true,
        message: 'Customer updated successfully',
        data: mappedCustomer,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'A customer with this email already exists',
        );
      }
      throw error;
    }
  }

  async remove(id: number) {
    // Check if customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    await this.prisma.customer.delete({
      where: { id },
    });

    return {
      result: true,
      message: 'Customer deleted successfully',
      data: null,
    };
  }
}
