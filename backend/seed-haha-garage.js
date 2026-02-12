import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Garage from './models/Garage.js';
import User from './models/User.js';
import Car from './models/Car.js';
import Order from './models/Order.js';
import Service from './models/Service.js';

dotenv.config();

async function seedHahaGarage() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Create Haha Garage
    let garage = await Garage.findOne({ name: /Haha Garage/i });
    if (!garage) {
      console.log('Creating Haha Garage...');
      
      const serviceNames = ["Engine Wash", "Interior Cleaning", "Wheel Alignment"];
      const services = [];
      for (const name of serviceNames) {
        let s = await Service.findOne({ name });
        if (!s) {
          s = new Service({ name, basePrice: 400, defaultDuration: 45 });
          await s.save();
        }
        services.push({
          service: s._id,
          CustomPrice: s.basePrice,
          serviceDescription: `${name} Service`,
          durationInMinutes: s.defaultDuration
        });
      }

      garage = new Garage({
        name: "Haha Garage",
        ownerName: "Haha Mechanic",
        phone: "+91 88888 77777",
        address: "789, 2nd Main, HSR Layout, Bangalore",
        location: {
          type: "Point",
          coordinates: [77.6387, 12.9141] // HSR Layout [lng, lat]
        },
        services: services,
        isVerified: true,
        experience: 5,
        specializations: ["Car Wash", "Detailing"]
      });
      await garage.save();
    }
    console.log('Haha Garage ID:', garage._id);

    // 2. Create a mock customer for Haha Garage
    let customer = await User.findOne({ phone: "+91 99999 00000" });
    if (!customer) {
      customer = new User({
        name: "Haha Customer",
        phone: "+91 99999 00000",
        email: "haha.customer@example.com",
        role: "customer"
      });
      await customer.save();
    }

    // 3. Create a mock car for Haha Customer
    let car = await Car.findOne({ owner: customer._id });
    if (!car) {
      car = new Car({
        owner: customer._id,
        make: "Toyota",
        model: "Innova",
        year: 2022,
        licensePlate: "KA 03 MN 5678",
        fuelType: "Diesel",
        transmission: "Automatic"
      });
      await car.save();
    }

    // 4. Create an Active Order for Haha Garage (Accepted)
    const activeOrder = new Order({
      customer: customer._id,
      car: car._id,
      serviceType: "normal",
      services: ["Engine Wash"],
      status: "accepted",
      garage: garage._id,
      serviceLocation: {
        latitude: 12.9145,
        longitude: 77.6390,
        address: "HSR Layout Sector 2, Bangalore",
        geoJSON: {
          type: "Point",
          coordinates: [77.6390, 12.9145]
        }
      },
      scheduledAt: new Date()
    });
    await activeOrder.save();
    console.log('Active Order created for Haha Garage');

    // 5. Create a Pending Order nearby Haha Garage
    const pendingOrder = new Order({
      customer: customer._id,
      car: car._id,
      serviceType: "normal",
      services: ["Wheel Alignment"],
      status: "pending",
      serviceLocation: {
        latitude: 12.9150,
        longitude: 77.6400,
        address: "HSR Layout Sector 3, Bangalore",
        geoJSON: {
          type: "Point",
          coordinates: [77.6400, 12.9150]
        }
      },
      scheduledAt: new Date(Date.now() + 172800000) // 2 days later
    });
    await pendingOrder.save();
    console.log('Pending Order created near Haha Garage');

    // 6. Create an Emergency Order nearby Haha Garage
    const emergencyOrder = new Order({
      customer: customer._id,
      car: car._id,
      serviceType: "breakdown",
      services: ["Tire Change"],
      status: "pending",
      serviceLocation: {
        latitude: 12.9130,
        longitude: 77.6370,
        address: "HSR Layout Sector 1, Bangalore",
        geoJSON: {
          type: "Point",
          coordinates: [77.6370, 12.9130]
        }
      },
      scheduledAt: new Date()
    });
    await emergencyOrder.save();
    console.log('Emergency Order created near Haha Garage');

    console.log('Seed completed successfully for Haha Garage');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seedHahaGarage();
