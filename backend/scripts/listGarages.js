import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Garage from '../models/Garage.js';

dotenv.config();

async function listGarages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all garages
    const garages = await Garage.find({});
    console.log(`Found ${garages.length} garages:`);
    
    garages.forEach(garage => {
      console.log(`\nGarage ID: ${garage._id}`);
      console.log(`Name: ${garage.name}`);
      console.log(`Location: ${garage.location}`);
      console.log(`Services:`);
      garage.services.forEach(service => {
        console.log(`  - ${service.name}: ₹${service.price}`);
      });
    });

    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('\n✅ MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Error listing garages:', error.message);
    process.exit(1);
  }
}

listGarages();
