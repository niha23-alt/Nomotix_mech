import mongoose from "mongoose";

const connectDB= async ()=>{
    try{
        console.log("Attempting to connect to MongoDB...");
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");
    }
    catch(err){
        console.log("MongoDB connection failed:", err.message);
        console.log("Server will continue running without database connection");
        // Don't exit the process, just log the error
        // process.exit()
    }
};
export default connectDB;