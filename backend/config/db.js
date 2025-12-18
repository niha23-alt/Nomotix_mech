import mongoose from "mongoose";

const connectDB= async ()=>{
    try{

        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
    }
    catch(err){
        console.log("MongoDB connection failed:", err.message);
        console.log("Server will continue running without database connection");
        // Don't exit the process, just log the error
        // process.exit()
    }
};
export default connectDB;