import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardData() {
    // Get total counts and revenue in parallel
    const [totalCars, totalBookings, totalCustomers, revenueData] =
      await Promise.all([
        this.prisma.car.count(),
        this.prisma.booking.count(),
        this.prisma.customer.count(),
        this.prisma.booking.aggregate({
          _sum: {
            totalBillAmount: true,
          },
        }),
      ]);

    const totalRevenue = revenueData._sum.totalBillAmount || 0;

    // Get chart data
    const chartData = await this.getChartData();

    return {
      result: true,
      message: 'Dashboard data retrieved successfully',
      data: {
        totalCars,
        totalBookings,
        totalCustomers,
        totalRevenue: Number(totalRevenue),
        charts: chartData,
      },
    };
  }

  private async getChartData() {
    // 1. Revenue Trend (Last 7 days)
    const revenueTrend = await this.getRevenueTrend();

    // 2. Bookings by Car Brand
    const bookingsByBrand = await this.getBookingsByBrand();

    // 3. Revenue vs Bookings (Last 6 months)
    const revenueVsBookings = await this.getRevenueVsBookings();

    // 4. Customer Growth (Last 6 months)
    const customerGrowth = await this.getCustomerGrowth();

    return {
      revenueTrend,
      bookingsByBrand,
      revenueVsBookings,
      customerGrowth,
    };
  }

  private async getRevenueTrend() {
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const revenue = await this.prisma.booking.aggregate({
        where: {
          bookingDate: {
            gte: date,
            lt: nextDate,
          },
        },
        _sum: {
          totalBillAmount: true,
        },
      });

      last7Days.push({
        date: date.toISOString().split('T')[0],
        revenue: Number(revenue._sum.totalBillAmount || 0),
      });
    }

    return last7Days;
  }

  private async getBookingsByBrand() {
    const bookings = await this.prisma.booking.findMany({
      include: {
        car: true,
      },
    });

    const brandCounts: { [key: string]: number } = {};

    bookings.forEach((booking) => {
      const brand = booking.car.brand;
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    });

    return Object.entries(brandCounts).map(([brand, count]) => ({
      brand,
      count,
    }));
  }

  private async getRevenueVsBookings() {
    const last6Months = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);

      const [bookingCount, revenueData] = await Promise.all([
        this.prisma.booking.count({
          where: {
            bookingDate: {
              gte: date,
              lt: nextMonth,
            },
          },
        }),
        this.prisma.booking.aggregate({
          where: {
            bookingDate: {
              gte: date,
              lt: nextMonth,
            },
          },
          _sum: {
            totalBillAmount: true,
          },
        }),
      ]);

      last6Months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        bookings: bookingCount,
        revenue: Number(revenueData._sum.totalBillAmount || 0),
      });
    }

    return last6Months;
  }

  private async getCustomerGrowth() {
    const last6Months = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);

      const customerCount = await this.prisma.customer.count({
        where: {
          createdAt: {
            lt: nextMonth,
          },
        },
      });

      last6Months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        customers: customerCount,
      });
    }

    return last6Months;
  }
}
