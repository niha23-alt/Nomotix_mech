import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: String,
  landmark: String,
  city: String,
  state: String,
  pincode: String,
  isLiveLocation: { type: Boolean, default: false },
  capturedAt: { type: Date, default: Date.now }
}, { _id: false });

const Orderschema = mongoose.Schema({
    // Customer and Car references
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },

    // Service details
    serviceType: { type: String, enum: ['breakdown', 'normal'], required: true },
    services: [{ type: mongoose.Schema.Types.Mixed }],
    garage: { type: mongoose.Schema.Types.ObjectId, ref: "Garage", required: false },

    // Location information
    serviceLocation: locationSchema,
    breakdownDetails:{
        location:{
            lat:Number,
            lng:Number,
            address:String,
        },
        Status:{
            type:String,enum:["pending","accepted","completed","in-progress"],default:"pending",
        },
        assignedGarage: { type: mongoose.Schema.Types.ObjectId, ref: "Garage" },
        cancellationReason: String,
        assignmentHistory: [
            {
            garage: { type: mongoose.Schema.Types.ObjectId, ref: "Garage" },
            status: { type: String, enum: ["assigned", "cancelled", "reassigned"] },
            timestamp: Date,
            comment: String,
    }
  ]
    },
    bill:{
        total:Number,
        breakdown:[{
            Service:String,
            Cost:Number,
        }],
    },
    status:{type:String,enum:["pending","accepted","completed","in-progress","cancelled"],default:"pending"},
    paymentStatus:{type:String,enum:["paid","unpaid","pending","failed","refunded"],default:"unpaid"},
    paymentMethod:{type:String,enum:["cash","card","upi","wallet","netbanking"],default:"cash"},
    paymentDetails:{
        transactionId:String,
        paymentGateway:String,
        amount:Number,
        upiTransactionId:String,
        upiVPA:String,
        paymentTimestamp:Date,
        gatewayResponse:mongoose.Schema.Types.Mixed,
        refundDetails:{
            refundId:String,
            refundAmount:Number,
            refundStatus:String,
            refundTimestamp:Date,
            refundReason:String
        }
    },
    createdAt:{type:Date,default:Date.now},
    scheduledAt:Date,

    // Cancellation details
    cancellationDetails:{
        cancelledAt:Date,
        cancelledBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
        cancellationReason:String,
        cancellationType:{type:String,enum:['customer','garage','system'],default:'customer'},
        refundStatus:{type:String,enum:['not_applicable','pending','processed','failed'],default:'not_applicable'},
        refundAmount:Number,
        cancellationFee:Number,
        cancellationPolicy:String
    },

    // Additional tracking fields
    completedAt: Date,
    estimatedDuration: Number, // in minutes
    actualDuration: Number, // in minutes

    // Service tracking
    serviceProgress: [{
      status: String,
      timestamp: { type: Date, default: Date.now },
      notes: String,
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],

    // Rating and feedback
    rating: {
      overall: { type: Number, min: 1, max: 5 },
      service: { type: Number, min: 1, max: 5 },
      timeliness: { type: Number, min: 1, max: 5 },
      staff: { type: Number, min: 1, max: 5 },
      feedback: String,
      ratedAt: Date
    },

    // Notes
    customerNotes: String,
    garageNotes: String,
    internalNotes: String,

    // Updated timestamp
    updatedAt: { type: Date, default: Date.now }
});

// Indexes for better performance
Orderschema.index({ customer: 1, createdAt: -1 });
Orderschema.index({ car: 1, createdAt: -1 });
Orderschema.index({ garage: 1, status: 1 });
Orderschema.index({ status: 1, scheduledAt: 1 });

// Update the updatedAt field before saving
Orderschema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Order', Orderschema);    

