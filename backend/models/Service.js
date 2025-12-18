import mongoose from "mongoose";

const ServiceSchema= new mongoose.Schema({
    name:String,
    description:String,
    basePrice:Number,
    defaultDuration:Number,
});
 export default mongoose.model("Service",ServiceSchema);