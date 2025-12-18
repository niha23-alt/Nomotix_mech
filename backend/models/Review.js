import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  garage: { type: mongoose.Schema.Types.ObjectId, ref: 'Garage', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // Reference to the order
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // only for customer reviews
  source: { type: String, enum: ['customer', 'team'], required: true },

  // Overall rating
  rating: { type: Number, min: 1, max: 5, required: true },

  // Detailed ratings
  serviceQuality: { type: Number, min: 1, max: 5 },
  timeliness: { type: Number, min: 1, max: 5 },
  pricing: { type: Number, min: 1, max: 5 },
  communication: { type: Number, min: 1, max: 5 },

  // Review content
  comment: String,
  title: String,

  // Additional fields
  reviewedBy: String, // Optional: 'AutoCare Admin', etc.
  serviceType: { type: String, enum: ['breakdown', 'normal'] },
  wouldRecommend: { type: Boolean, default: true },

  // Media attachments
  images: [String], // URLs to uploaded images

  // Status
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
// Indexes for better query performance
reviewSchema.index({ garage: 1, service: 1, createdAt: -1 });
reviewSchema.index({ customer: 1, createdAt: -1 });
reviewSchema.index({ order: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ status: 1, createdAt: -1 });

// Middleware to update updatedAt on save
reviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for calculating average detailed rating
reviewSchema.virtual('averageDetailedRating').get(function() {
  const ratings = [this.serviceQuality, this.timeliness, this.pricing, this.communication].filter(r => r);
  if (ratings.length === 0) return this.rating;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

// Static method to calculate garage average rating
reviewSchema.statics.calculateGarageAverageRating = async function(garageId) {
  const result = await this.aggregate([
    { $match: { garage: garageId, status: 'approved' } },
    { $group: {
      _id: null,
      averageRating: { $avg: '$rating' },
      totalReviews: { $sum: 1 },
      ratingDistribution: {
        $push: '$rating'
      }
    }}
  ]);

  return result[0] || { averageRating: 0, totalReviews: 0, ratingDistribution: [] };
};

export default mongoose.model('Review', reviewSchema);