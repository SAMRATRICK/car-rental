import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page?: number, pageSize?: number) {
    // If pagination parameters provided
    if (page && pageSize) {
      const skip = (page - 1) * pageSize;
      const take = pageSize;

      const [cars, total] = await Promise.all([
        this.prisma.car.findMany({
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.car.count(),
      ]);

      // Map id to carId for frontend compatibility
      const mappedCars = cars.map(car => ({
        ...car,
        carId: car.id
      }));

      return {
        result: true,
        message: 'Cars retrieved successfully',
        data: mappedCars,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    }

    // Return all cars without pagination
    const cars = await this.prisma.car.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Map id to carId for frontend compatibility
    const mappedCars = cars.map(car => ({
      ...car,
      carId: car.id
    }));

    return {
      result: true,
      message: 'Cars retrieved successfully',
      data: mappedCars,
    };
  }

  async create(createCarDto: CreateCarDto) {
    try {
      const car = await this.prisma.car.create({
        data: {
          brand: createCarDto.brand,
          model: createCarDto.model,
          year: createCarDto.year,
          color: createCarDto.color,
          dailyRate: createCarDto.dailyRate,
          carImage: createCarDto.carImage,
          regNo: createCarDto.regNo,
        },
      });

      // Map id to carId for frontend compatibility
      const mappedCar = {
        ...car,
        carId: car.id
      };

      return {
        result: true,
        message: 'Vehicle added successfully',
        data: mappedCar,
      };
    } catch (error) {
      console.error('Error creating car:', error);
      if (error.code === 'P2002') {
        return {
          result: false,
          message: 'A vehicle with this registration number already exists',
          data: null,
        };
      }
      return {
        result: false,
        message: 'Failed to create vehicle: ' + (error.message || 'Unknown error'),
        data: null,
      };
    }
  }

  async update(updateCarDto: UpdateCarDto) {
    const { carId, ...data } = updateCarDto;

    // Check if car exists
    const existingCar = await this.prisma.car.findUnique({
      where: { id: carId },
    });

    if (!existingCar) {
      throw new NotFoundException(`Car with ID ${carId} not found`);
    }

    try {
      const car = await this.prisma.car.update({
        where: { id: carId },
        data,
      });

      // Map id to carId for frontend compatibility
      const mappedCar = {
        ...car,
        carId: car.id
      };

      return {
        result: true,
        message: 'Vehicle updated successfully',
        data: mappedCar,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'A vehicle with this registration number already exists',
        );
      }
      throw error;
    }
  }

  async remove(id: number) {
    // Check if car exists
    const car = await this.prisma.car.findUnique({
      where: { id },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    await this.prisma.car.delete({
      where: { id },
    });

    return {
      result: true,
      message: 'Vehicle deleted successfully',
      data: null,
    };
  }
}
