import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('88889999', 10);
  const user = await prisma.user.upsert({
    where: { username: 'samrat' },
    update: {},
    create: {
      username: 'samrat',
      password: hashedPassword,
      email: 'samrat@carrental.com',
      role: 'admin',
    },
  });
  console.log('✅ Created user:', user.username);

  // Create sample cars
  const cars = await Promise.all([
    prisma.car.upsert({
      where: { regNo: 'MH-01-AB-1234' },
      update: {},
      create: {
        brand: 'Toyota',
        model: 'Camry',
        year: 2023,
        color: 'Silver',
        dailyRate: 2500.0,
        carImage: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb',
        regNo: 'MH-01-AB-1234',
      },
    }),
    prisma.car.upsert({
      where: { regNo: 'MH-02-CD-5678' },
      update: {},
      create: {
        brand: 'Honda',
        model: 'Civic',
        year: 2022,
        color: 'Blue',
        dailyRate: 2000.0,
        carImage: 'https://images.unsplash.com/photo-1590362891991-f776e747a588',
        regNo: 'MH-02-CD-5678',
      },
    }),
    prisma.car.upsert({
      where: { regNo: 'MH-03-EF-9012' },
      update: {},
      create: {
        brand: 'BMW',
        model: 'X5',
        year: 2024,
        color: 'Black',
        dailyRate: 5000.0,
        carImage: 'https://images.unsplash.com/photo-1555215695-3004980ad54e',
        regNo: 'MH-03-EF-9012',
      },
    }),
    prisma.car.upsert({
      where: { regNo: 'MH-04-GH-3456' },
      update: {},
      create: {
        brand: 'Mercedes',
        model: 'C-Class',
        year: 2023,
        color: 'White',
        dailyRate: 4500.0,
        carImage: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8',
        regNo: 'MH-04-GH-3456',
      },
    }),
    prisma.car.upsert({
      where: { regNo: 'MH-05-IJ-7890' },
      update: {},
      create: {
        brand: 'Hyundai',
        model: 'Creta',
        year: 2023,
        color: 'Red',
        dailyRate: 1800.0,
        carImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf',
        regNo: 'MH-05-IJ-7890',
      },
    }),
  ]);
  console.log(`✅ Created ${cars.length} cars`);

  // Create sample customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        customerName: 'John Doe',
        customerCity: 'Mumbai',
        mobileNo: '+91-9876543210',
        email: 'john.doe@example.com',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'jane.smith@example.com' },
      update: {},
      create: {
        customerName: 'Jane Smith',
        customerCity: 'Delhi',
        mobileNo: '+91-9876543211',
        email: 'jane.smith@example.com',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'robert.brown@example.com' },
      update: {},
      create: {
        customerName: 'Robert Brown',
        customerCity: 'Bangalore',
        mobileNo: '+91-9876543212',
        email: 'robert.brown@example.com',
      },
    }),
  ]);
  console.log(`✅ Created ${customers.length} customers`);

  // Create sample bookings
  const bookings = [];
  const bookingData = [
    { customerId: customers[0].id, carId: cars[0].id, days: 3, discount: 0 },
    { customerId: customers[0].id, carId: cars[1].id, days: 5, discount: 200 },
    { customerId: customers[1].id, carId: cars[2].id, days: 2, discount: 0 },
    { customerId: customers[1].id, carId: cars[3].id, days: 4, discount: 500 },
    { customerId: customers[2].id, carId: cars[4].id, days: 7, discount: 300 },
    { customerId: customers[2].id, carId: cars[0].id, days: 3, discount: 0 },
    { customerId: customers[0].id, carId: cars[2].id, days: 1, discount: 0 },
    { customerId: customers[1].id, carId: cars[4].id, days: 6, discount: 400 },
    { customerId: customers[2].id, carId: cars[1].id, days: 4, discount: 0 },
    { customerId: customers[0].id, carId: cars[3].id, days: 2, discount: 100 },
  ];

  for (let i = 0; i < bookingData.length; i++) {
    const data = bookingData[i];
    const customer = customers.find((c) => c.id === data.customerId);
    const car = cars.find((c) => c.id === data.carId);

    if (customer && car) {
      const totalBillAmount =
        Number(car.dailyRate) * data.days - data.discount;
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() - (10 - i)); // Spread bookings over last 10 days

      const booking = await prisma.booking.create({
        data: {
          customerId: customer.id,
          carId: car.id,
          customerName: customer.customerName,
          customerCity: customer.customerCity,
          mobileNo: customer.mobileNo,
          email: customer.email,
          bookingDate: bookingDate,
          discount: data.discount,
          totalBillAmount: totalBillAmount,
        },
      });
      bookings.push(booking);
    }
  }
  console.log(`✅ Created ${bookings.length} bookings`);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
