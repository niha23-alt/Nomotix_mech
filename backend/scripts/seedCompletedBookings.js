import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Car from '../models/Car.js';
import Garage from '../models/Garage.js';
import Order from '../models/Order.js';

dotenv.config();

const BASE_URL = 'http://localhost:5001/api';

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the garage named 'Niha'
    const garage = await Garage.findOne({ name: 'Niha' });
    if (!garage) {
      console.error('❌ Garage named "Niha" not found');
      return;
    }
    console.log('✅ Garage found:', garage.name, 'with ID:', garage._id);

    // Update garage services if they're undefined
    if (!garage.services || garage.services.length === 0 || garage.services[0].name === undefined) {
      console.log('Updating garage services...');
      garage.services = [{ name: 'Tyres', price: 1000 }];
      await garage.save();
      console.log('✅ Updated garage services');
    }

    // Create test users and cars if they don't exist
    let users = await User.find({}).limit(5);
    let cars = await Car.find({}).limit(5);

    // Create test users if none exist
    if (users.length === 0) {
      console.log('Creating test users...');
      const testUsers = [
        { name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
        { name: 'Jane Smith', email: 'jane@example.com', phone: '9876543210' },
        { name: 'Mike Johnson', email: 'mike@example.com', phone: '4567891230' },
        { name: 'Sarah Williams', email: 'sarah@example.com', phone: '7891234560' },
        { name: 'David Brown', email: 'david@example.com', phone: '3216549870' }
      ];
      users = await User.insertMany(testUsers);
      console.log('✅ Created test users');
    }

    // Create test cars if none exist
    if (cars.length === 0) {
      console.log('Creating test cars...');
      const testCars = [
        { owner: users[0]._id, make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'TS01AB1234' },
        { owner: users[1]._id, make: 'Honda', model: 'Civic', year: 2018, licensePlate: 'TS02CD5678' },
        { owner: users[2]._id, make: 'Ford', model: 'Mustang', year: 2022, licensePlate: 'TS03EF9012' },
        { owner: users[3]._id, make: 'Maruti', model: 'Swift', year: 2021, licensePlate: 'TS04GH3456' },
        { owner: users[4]._id, make: 'Hyundai', model: 'i20', year: 2019, licensePlate: 'TS05IJ7890' }
      ];
      cars = await Car.insertMany(testCars);
      console.log('✅ Created test cars');
    }

    // Create 12 completed bookings
    console.log('Creating 12 completed bookings...');
    const bookings = [];
    const serviceType = 'normal';
    
    // Use the garage's actual service
    const service = garage.services[0];
    
    for (let i = 0; i < 12; i++) {
      const userIndex = i % users.length;
      const carIndex = i % cars.length;
      const now = new Date();
      
      const booking = new Order({
        customer: users[userIndex]._id,
        car: cars[carIndex]._id,
        serviceType: serviceType,
        services: [service], // Only use the garage's actual service
        garage: garage._id,
        serviceLocation: {
          latitude: 17.3850 + (Math.random() * 0.1 - 0.05), // Around Hyderabad
          longitude: 78.4867 + (Math.random() * 0.1 - 0.05),
          address: `Test Address ${i + 1}`,
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500001'
        },
        bill: {
          total: service.price,
          breakdown: [{
            Service: service.name,
            Cost: service.price
          }]
        },
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod: 'cash',
        createdAt: new Date(now.getTime() - (12 - i) * 24 * 60 * 60 * 1000), // Spread over 12 days
        completedAt: new Date(now.getTime() - (12 - i) * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours after creation
        updatedAt: new Date(now.getTime() - (12 - i) * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000)
      });
      
      bookings.push(booking);
    }

    // Insert all bookings
    const insertedBookings = await Order.insertMany(bookings);
    console.log(`✅ Created ${insertedBookings.length} completed bookings`);

    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('✅ MongoDB connection closed');
    
    console.log('🎉 Seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedData();
