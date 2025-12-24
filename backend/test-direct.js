import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function run() {
  try {
    console.log("Testing direct MongoDB connection...");
    await client.connect();
    console.log("Connected successfully to server");
  } catch (err) {
    console.error("Connection failed:");
    console.error(err);
  } finally {
    await client.close();
  }
}
run();
