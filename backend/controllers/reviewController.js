import Review from '../models/Review.js';
import Garage from '../models/Garage.js';
import Order from '../models/Order.js';
import mongoose from 'mongoose';


export const addReview = async (req, res) => {
  const { garage,service, customer, source, rating, comment, reviewedBy } = req.body;

  if (!garage || !source || !rating) {
    return res.status(400).json({ message: 'Garage, source, and rating are required' });
  }

  try {
    const review = new Review({
      garage,
      service,
      customer: source === 'customer' ? customer : undefined,
      source,
      rating,
      comment,
      reviewedBy: source === 'team' ? reviewedBy : undefined
    });

    await review.save();


    const reviews = await Review.find({ garage, source });
    const total = reviews.length;
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / total;

    const updateField = source === 'customer'
      ? {
          'ratingsSummary.customer.average': avg,
          'ratingsSummary.customer.totalReviews': total
        }
      : {
          'ratingsSummary.teamReview.average': avg,
          'ratingsSummary.teamReview.totalReviews': total
        };

    await Garage.findByIdAndUpdate(garage, { $set: updateField });

    res.status(201).json({ message: '✅ Review added', review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getReviewsByGarage = async (req, res) => {
  try {
    const reviews = await Review.find({ garage: req.params.garageId })
      .populate('customer', 'name email') // optional
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getReviewsForService = async (req, res) => {
  const { garageId, serviceId } = req.params;
  if (!garageId || !serviceId) {
    return res.status(400).json({ message: 'Garage ID and Service ID are required' });
  }
  try {
    const reviews = await Review.find({ garage: garageId, service: serviceId })
      .sort({ createdAt: -1 }).limit(5).select('rating comment source createdAt reviewedBy').lean();
    const customerReviews =reviews.filter((r) => r.source === "customer").map( (r) => ({
      rating:r.rating,
      comment:r.comment,
      createdAt:r.createdAt,
      reviewedBy:r.reviewedBy || "Anonymous",
    }));
    const teamReviews =reviews.filter((r) => r.source === "team").map( (r) => ({
      rating: r.rating,
      comment: r.comment,
      createdAt:r.createdAt,
      reviewedBy:r.reviewedBy || "OGExpress Team",
    }))
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Enhanced function to create detailed review for completed orders
export const createOrderReview = async (req, res) => {
  try {
    const {
      orderId,
      rating,
      serviceQuality,
      timeliness,
      pricing,
      communication,
      comment,
      title,
      wouldRecommend,
      images
    } = req.body;

    // Validate required fields
    if (!orderId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Order ID and rating are required"
      });
    }

    // Get order details
    const order = await Order.findById(orderId)
      .populate('Customer', 'name email')
      .populate('garage', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: "Can only review completed orders"
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ order: orderId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "Review already exists for this order"
      });
    }

    // Create comprehensive review
    const review = new Review({
      garage: order.garage._id,
      order: orderId,
      customer: order.Customer._id,
      source: 'customer',
      rating: parseInt(rating),
      serviceQuality: serviceQuality ? parseInt(serviceQuality) : undefined,
      timeliness: timeliness ? parseInt(timeliness) : undefined,
      pricing: pricing ? parseInt(pricing) : undefined,
      communication: communication ? parseInt(communication) : undefined,
      comment: comment || '',
      title: title || '',
      serviceType: order.serviceType,
      wouldRecommend: wouldRecommend !== undefined ? wouldRecommend : true,
      images: images || [],
      status: 'approved'
    });

    await review.save();

    // Update garage ratings
    await updateGarageRatings(order.garage._id);

    // Populate review for response
    const populatedReview = await Review.findById(review._id)
      .populate('customer', 'name email')
      .populate('garage', 'name')
      .populate('order', 'serviceType createdAt');

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: populatedReview
    });

  } catch (error) {
    console.error("Create order review error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Check if customer can review an order
export const canReviewOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { customerId } = req.query;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required"
      });
    }

    // Check if order exists and belongs to customer
    const order = await Order.findOne({
      _id: orderId,
      Customer: customerId
    }).populate('garage', 'name');

    if (!order) {
      return res.json({
        canReview: false,
        reason: "Order not found or unauthorized"
      });
    }

    if (order.status !== 'completed') {
      return res.json({
        canReview: false,
        reason: "Order not completed yet"
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ order: orderId });
    if (existingReview) {
      return res.json({
        canReview: false,
        reason: "Review already submitted",
        existingReview: {
          _id: existingReview._id,
          rating: existingReview.rating,
          comment: existingReview.comment,
          createdAt: existingReview.createdAt
        }
      });
    }

    res.json({
      canReview: true,
      order: {
        _id: order._id,
        serviceType: order.serviceType,
        garage: order.garage,
        createdAt: order.createdAt,
        services: order.services
      }
    });

  } catch (error) {
    console.error("Can review order error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get customer's reviews
export const getCustomerReviews = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      customer: customerId,
      status: 'approved'
    })
      .populate('garage', 'name location')
      .populate('order', 'serviceType createdAt services')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalReviews = await Review.countDocuments({
      customer: customerId,
      status: 'approved'
    });

    res.json({
      success: true,
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasNext: skip + reviews.length < totalReviews,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error("Get customer reviews error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get garage rating statistics
export const getGarageStats = async (req, res) => {
  try {
    const { garageId } = req.params;

    const stats = await Review.aggregate([
      { $match: { garage: new mongoose.Types.ObjectId(garageId), status: 'approved' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          averageServiceQuality: { $avg: '$serviceQuality' },
          averageTimeliness: { $avg: '$timeliness' },
          averagePricing: { $avg: '$pricing' },
          averageCommunication: { $avg: '$communication' },
          recommendationRate: { $avg: { $cond: ['$wouldRecommend', 1, 0] } },
          ratingDistribution: { $push: '$rating' }
        }
      }
    ]);

    // Calculate rating distribution
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (stats[0]?.ratingDistribution) {
      stats[0].ratingDistribution.forEach(rating => {
        ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
      });
    }

    const result = stats[0] || {
      averageRating: 0,
      totalReviews: 0,
      averageServiceQuality: 0,
      averageTimeliness: 0,
      averagePricing: 0,
      averageCommunication: 0,
      recommendationRate: 0
    };

    result.ratingDistribution = ratingCounts;

    res.json({
      success: true,
      stats: result
    });

  } catch (error) {
    console.error("Get garage stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to update garage ratings
async function updateGarageRatings(garageId) {
  try {
    const stats = await Review.calculateGarageAverageRating(garageId);

    await Garage.findByIdAndUpdate(garageId, {
      $set: {
        'ratingsSummary.customer.average': stats.averageRating || 0,
        'ratingsSummary.customer.totalReviews': stats.totalReviews || 0
      }
    });
  } catch (error) {
    console.error("Update garage ratings error:", error);
  }
}