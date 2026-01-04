import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Garage from './models/Garage.js';
import User from './models/User.js';
import Car from './models/Car.js';
import Order from './models/Order.js';
import Service from './models/Service.js';

dotenv.config();

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Find or create Vedakshari's garage
    let garage = await Garage.findOne({ name: /Vedakshari/i });
    if (!garage) {
      console.log('Garage not found, creating a mock one for Vedakshari...');
      
      // Create some basic services first
      const services = [];
      const serviceNames = ["Oil Change", "Brake Repair", "Engine Tuning", "Full Service"];
      for (const name of serviceNames) {
        let s = await Service.findOne({ name });
        if (!s) {
          s = new Service({ name, basePrice: 500, defaultDuration: 60 });
          await s.save();
        }
        services.push({
          service: s._id,
          CustomPrice: s.basePrice,
          serviceDescription: `Professional ${name}`,
          durationInMinutes: s.defaultDuration
        });
      }

      garage = new Garage({
        name: "Vedakshari's Multi-Brand Garage",
        ownerName: "Vedakshari",
        phone: "+91 98765 43210",
        address: "123, 4th Cross, Koramangala, Bangalore",
        location: {
          type: "Point",
          coordinates: [77.6245, 12.9345] // Koramangala [lng, lat]
        },
        services: services,
        isVerified: true,
        experience: 10,
        specializations: ["Luxury Cars", "Engine Specialist"]
      });
      await garage.save();
    }
    console.log('Garage ID:', garage._id);

    // 2. Find or create a mock customer
    let customer = await User.findOne({ phone: "+91 12345 67890" });
    if (!customer) {
      customer = new User({
        name: "Mock Customer",
        phone: "+91 12345 67890",
        email: "customer@example.com",
        role: "customer"
      });
      await customer.save();
    }

    // 3. Find or create a mock car
    let car = await Car.findOne({ owner: customer._id });
    if (!car) {
      car = new Car({
        owner: customer._id,
        make: "Honda",
        model: "City",
        year: 2021,
        licensePlate: "KA 01 AB 1234",
        vinNumber: "HONDA123456789",
        fuelType: "Petrol",
        transmission: "Manual"
      });
      await car.save();
    }

    // 4. Create a Pending Nearby Order (should appear in Booking Requests)
    const nearbyOrder = new Order({
      customer: customer._id,
      car: car._id,
      serviceType: "normal",
      services: ["Oil Change", "Brake Check"],
      status: "pending",
      serviceLocation: {
        latitude: 12.9350,
        longitude: 77.6250,
        address: "Koramangala 5th Block, Bangalore",
        geoJSON: {
          type: "Point",
          coordinates: [77.6250, 12.9350]
        }
      },
      scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
    });
    await nearbyOrder.save();

    // 5. Create an Emergency Order (should appear in Emergency)
    const emergencyOrder = new Order({
      customer: customer._id,
      car: car._id,
      serviceType: "breakdown",
      services: ["Engine Not Starting"],
      status: "pending",
      serviceLocation: {
        latitude: 12.9340,
        longitude: 77.6240,
        address: "Near Koramangala Police Station",
        geoJSON: {
          type: "Point",
          coordinates: [77.6240, 12.9340]
        }
      },
      scheduledAt: new Date(),
    });
    await emergencyOrder.save();

    // 6. Create an Active Order (should appear in Active Bookings)
    const activeOrder = new Order({
      customer: customer._id,
      car: car._id,
      garage: garage._id,
      serviceType: "normal",
      services: ["Full Service"],
      status: "accepted",
      serviceLocation: {
        latitude: 12.9345,
        longitude: 77.6245,
        address: "Koramangala 4th Block",
        geoJSON: {
          type: "Point",
          coordinates: [77.6245, 12.9345]
        }
      },
      scheduledAt: new Date(),
    });
    await activeOrder.save();

    console.log('Successfully seeded data for Vedakshari\'s Garage!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seedData();
