import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  
  // References
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  
  // Payment details
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  
  // Payment method
  paymentMethod: { 
    type: String, 
    enum: ['upi', 'card', 'netbanking', 'wallet', 'cash'], 
    required: true 
  },
  
  // UPI specific details
  upiDetails: {
    vpa: String, // Virtual Payment Address
    transactionId: String,
    rrn: String, // Retrieval Reference Number
    approvalRefNo: String,
    responseCode: String,
    responseMessage: String
  },
  
  // Card specific details
  cardDetails: {
    last4Digits: String,
    cardType: { type: String, enum: ['credit', 'debit'] },
    bankName: String,
    cardNetwork: { type: String, enum: ['visa', 'mastercard', 'rupay', 'amex'] }
  },
  
  // Payment gateway details
  gateway: {
    provider: { type: String, enum: ['razorpay', 'payu', 'phonepe', 'gpay', 'paytm'] },
    gatewayTransactionId: String,
    gatewayOrderId: String,
    gatewayPaymentId: String,
    signature: String,
    webhookData: mongoose.Schema.Types.Mixed
  },
  
  // Payment status
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'success', 'failed', 'cancelled', 'refunded'], 
    default: 'pending' 
  },
  
  // Timestamps
  initiatedAt: { type: Date, default: Date.now },
  completedAt: Date,
  failedAt: Date,
  
  // Failure details
  failureReason: String,
  failureCode: String,
  
  // Refund details
  refund: {
    refundId: String,
    refundAmount: Number,
    refundStatus: { type: String, enum: ['pending', 'processed', 'failed'] },
    refundReason: String,
    refundInitiatedAt: Date,
    refundCompletedAt: Date,
    refundFailedAt: Date,
    refundFailureReason: String
  },
  
  // Additional metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceInfo: String,
    location: {
      latitude: Number,
      longitude: Number,
      city: String,
      state: String
    }
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for better performance
PaymentSchema.index({ user: 1, createdAt: -1 });
PaymentSchema.index({ car: 1, createdAt: -1 });
PaymentSchema.index({ order: 1 });
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ 'gateway.gatewayTransactionId': 1 });
PaymentSchema.index({ 'upiDetails.transactionId': 1 });

// Update the updatedAt field before saving
PaymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Payment", PaymentSchema);
