import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Car from "../models/Car.js";
import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay (only if keys are provided)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// Create payment order
export const createPaymentOrder = async (req, res) => {
  try {
    const { orderId, amount, currency = 'INR' } = req.body;
    const userId = req.user.id;

    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(500).json({
        message: "Payment gateway not configured. Please contact support."
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findOne({ _id: orderId, customer: userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: currency,
      receipt: `order_${orderId}_${Date.now()}`,
      notes: {
        orderId: orderId,
        userId: userId,
        carId: order.car.toString()
      }
    });

    // Create payment record
    const payment = new Payment({
      user: userId,
      car: order.car,
      order: orderId,
      amount: amount,
      currency: currency,
      paymentMethod: 'upi',
      gateway: {
        provider: 'razorpay',
        gatewayOrderId: razorpayOrder.id
      },
      status: 'pending',
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    await payment.save();

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id
    });

  } catch (err) {
    console.error('Create payment order error:', err);
    res.status(500).json({ 
      message: "Failed to create payment order. Please try again.",
      error: err.message 
    });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      paymentId 
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: "Payment verification failed" 
      });
    }

    // Update payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    // Get payment details from Razorpay
    const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);

    // Update payment with success details
    payment.status = 'success';
    payment.completedAt = new Date();
    payment.gateway.gatewayPaymentId = razorpay_payment_id;
    payment.gateway.signature = razorpay_signature;
    
    // Update UPI details if available
    if (razorpayPayment.method === 'upi') {
      payment.upiDetails = {
        vpa: razorpayPayment.vpa,
        transactionId: razorpayPayment.acquirer_data?.rrn,
        rrn: razorpayPayment.acquirer_data?.rrn,
        approvalRefNo: razorpayPayment.acquirer_data?.upi_transaction_id
      };
    }

    await payment.save();

    // Update order payment status
    const order = await Order.findById(payment.order);
    if (order) {
      order.paymentStatus = 'paid';
      order.paymentDetails = {
        transactionId: razorpay_payment_id,
        paymentTime: new Date(),
        paymentGateway: 'razorpay'
      };
      await order.save();
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
      payment: {
        id: payment._id,
        status: payment.status,
        amount: payment.amount,
        completedAt: payment.completedAt
      }
    });

  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ 
      message: "Payment verification failed. Please try again.",
      error: err.message 
    });
  }
};

// Get payment history for user
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, carId } = req.query;

    const query = { user: userId };
    if (carId) {
      query.car = carId;
    }

    const payments = await Payment.find(query)
      .populate('car', 'make model year licensePlate customName')
      .populate('order', 'services totalAmount scheduledDate status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (err) {
    console.error('Get payment history error:', err);
    res.status(500).json({ 
      message: "Failed to fetch payment history. Please try again.",
      error: err.message 
    });
  }
};

// Get payment details
export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({ _id: paymentId, user: userId })
      .populate('car', 'make model year licensePlate customName')
      .populate('order', 'services totalAmount scheduledDate status garage')
      .populate('user', 'name email phone');

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({ payment });

  } catch (err) {
    console.error('Get payment details error:', err);
    res.status(500).json({ 
      message: "Failed to fetch payment details. Please try again.",
      error: err.message 
    });
  }
};

// Initiate refund
export const initiateRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;
    const userId = req.user.id;

    const payment = await Payment.findOne({ _id: paymentId, user: userId });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status !== 'success') {
      return res.status(400).json({ message: "Only successful payments can be refunded" });
    }

    // Create refund with Razorpay
    const refund = await razorpay.payments.refund(payment.gateway.gatewayPaymentId, {
      amount: amount * 100, // Convert to paise
      notes: {
        reason: reason,
        refund_initiated_by: userId
      }
    });

    // Update payment with refund details
    payment.refund = {
      refundId: refund.id,
      refundAmount: amount,
      refundStatus: 'pending',
      refundReason: reason,
      refundInitiatedAt: new Date()
    };

    await payment.save();

    res.json({
      success: true,
      message: "Refund initiated successfully",
      refundId: refund.id,
      amount: amount
    });

  } catch (err) {
    console.error('Initiate refund error:', err);
    res.status(500).json({ 
      message: "Failed to initiate refund. Please try again.",
      error: err.message 
    });
  }
};

// Webhook handler for payment updates
export const handleWebhook = async (req, res) => {
  try {
    const webhookSignature = req.get('X-Razorpay-Signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const { event, payload } = req.body;

    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(payload.payment.entity);
        break;
      case 'refund.processed':
        await handleRefundProcessed(payload.refund.entity);
        break;
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    res.json({ success: true });

  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ message: "Webhook processing failed" });
  }
};

// Helper functions for webhook events
const handlePaymentCaptured = async (paymentData) => {
  const payment = await Payment.findOne({ 
    'gateway.gatewayPaymentId': paymentData.id 
  });
  
  if (payment) {
    payment.status = 'success';
    payment.completedAt = new Date();
    await payment.save();
  }
};

const handlePaymentFailed = async (paymentData) => {
  const payment = await Payment.findOne({ 
    'gateway.gatewayPaymentId': paymentData.id 
  });
  
  if (payment) {
    payment.status = 'failed';
    payment.failedAt = new Date();
    payment.failureReason = paymentData.error_description;
    payment.failureCode = paymentData.error_code;
    await payment.save();
  }
};

const handleRefundProcessed = async (refundData) => {
  const payment = await Payment.findOne({ 
    'refund.refundId': refundData.id 
  });
  
  if (payment) {
    payment.refund.refundStatus = 'processed';
    payment.refund.refundCompletedAt = new Date();
    await payment.save();
  }
};
