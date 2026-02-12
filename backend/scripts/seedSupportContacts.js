import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SupportContact from '../models/SupportContact.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nomotix_mech');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Seed support contacts
const seedSupportContacts = async () => {
  try {
    await connectDB();

    // Define support contacts
    const supportContacts = [
      { name: 'Niharika', phone: '9392807288' },
      { name: 'Mohnish', phone: '9392445112' }
    ];

    // Insert contacts
    await SupportContact.insertMany(supportContacts);
    console.log('Support contacts seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding support contacts:', error);
    process.exit(1);
  }
};

seedSupportContacts();