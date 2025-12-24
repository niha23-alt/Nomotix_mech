import mongoose from "mongoose";

const CarSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  
  // Owner reference
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Basic car information
  customName: String, // User-defined name for the car
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  licensePlate: { type: String, required: true, unique: true },
  
  // Technical details
  fuelType: { 
    type: String, 
    enum: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'],
    default:'Petrol'
  },
  engineCapacity: String, // e.g., "1.5L", "2000cc"
  transmission: { 
    type: String, 
    enum: ['Manual', 'Automatic', 'CVT', 'AMT'], 
    default: 'Manual' 
  },
  color: String,
  
  // Vehicle identification
  vinNumber: String, // Vehicle Identification Number
  engineNumber: String,
  chassisNumber: String,
  
  // Registration details
  registrationDate: Date,
  registrationState: String,
  registrationCity: String,
  
  // Insurance details
  insuranceProvider: String,
  insurancePolicyNumber: String,
  insuranceExpiryDate: Date,
  
  // Images
  images: [{
    url: String,
    type: { type: String, enum: ['front', 'back', 'side', 'interior', 'documents', 'other'] },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Service history
  serviceHistory: [{
    serviceDate: Date,
    serviceType: String,
    garage: { type: mongoose.Schema.Types.ObjectId, ref: 'Garage' },
    mileage: Number,
    cost: Number,
    description: String,
    nextServiceDue: Date
  }],
  
  // Current status
  currentMileage: Number,
  lastServiceDate: Date,
  nextServiceDue: Date,
  
  // Car condition
  condition: { 
    type: String, 
    enum: ['Excellent', 'Good', 'Fair', 'Poor'], 
    default: 'Good' 
  },
  
  // Verification status
  isVerified: { type: Boolean, default: false },
  verificationDocuments: [{
    type: { type: String, enum: ['RC', 'Insurance', 'PUC', 'Other'] },
    url: String,
    uploadedAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false }
  }],
  
  // Status
  isActive: { type: Boolean, default: true },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for better performance
CarSchema.index({ owner: 1 });
CarSchema.index({ make: 1, model: 1 });

// Update the updatedAt field before saving
CarSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for display name
CarSchema.virtual('displayName').get(function() {
  return this.customName || `${this.make} ${this.model} (${this.year})`;
});

export default mongoose.model("Car", CarSchema);
