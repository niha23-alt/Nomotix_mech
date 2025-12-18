import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['order_created', 'order_updated', 'order_cancelled', 'order_deleted', 'payment_processed', 'refund_processed']
  },
  
  entityType: {
    type: String,
    required: true,
    enum: ['order', 'payment', 'review', 'user', 'garage']
  },
  
  entityId: {
    type: String,
    required: true
  },
  
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  performedByType: {
    type: String,
    enum: ['customer', 'garage', 'admin', 'system'],
    default: 'customer'
  },
  
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  metadata: {
    ipAddress: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now },
    reason: String,
    previousState: mongoose.Schema.Types.Mixed,
    newState: mongoose.Schema.Types.Mixed
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

// Static method to log actions
auditLogSchema.statics.logAction = async function(actionData) {
  try {
    const auditEntry = new this(actionData);
    await auditEntry.save();
    return auditEntry;
  } catch (error) {
    console.error('Audit log error:', error);
    // Don't throw error to prevent breaking main functionality
    return null;
  }
};

export default mongoose.model('AuditLog', auditLogSchema);
