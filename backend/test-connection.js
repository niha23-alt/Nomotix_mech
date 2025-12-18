import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing MongoDB connection...');
console.log('Connection string:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  family: 4, // Use IPv4, skip trying IPv6
})
.then(() => {
  console.log('✅ MongoDB connected successfully!');
  process.exit(0);
})
.catch((err) => {
  console.log('❌ MongoDB connection failed:');
  console.log('Error name:', err.name);
  console.log('Error message:', err.message);
  console.log('Error code:', err.code);
  if (err.reason) {
    console.log('Error reason:', err.reason);
  }
  process.exit(1);
});
