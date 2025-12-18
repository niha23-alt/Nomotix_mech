import express from 'express';
import PaymentService from '../services/paymentService.js';
import Order from '../models/Order.js';
import { createHmac } from 'crypto';
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  getPaymentDetails,
  initiateRefund,
  handleWebhook
} from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create Payment Order (Razorpay)
router.post('/create-order', async (req, res) => {
    try {
        const { orderId, amount, currency = 'INR' } = req.body;

        // Validate order exists
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Create Razorpay order
        const paymentOrder = await PaymentService.createRazorpayOrder({
            orderId,
            amount,
            currency,
            serviceType: order.serviceType
        });

        if (paymentOrder.success) {
            // Update order with payment details
            await Order.findByIdAndUpdate(orderId, {
                paymentStatus: 'pending',
                'paymentDetails.paymentGateway': 'razorpay',
                'paymentDetails.amount': amount
            });

            res.json({
                success: true,
                data: {
                    orderId: paymentOrder.data.id,
                    amount: paymentOrder.data.amount,
                    currency: paymentOrder.data.currency,
                    key: process.env.RAZORPAY_KEY_ID
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: paymentOrder.error
            });
        }
    } catch (error) {
        console.error('Payment order creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Create PhonePe Payment
router.post('/phonepe/create', async (req, res) => {
    try {
        const { orderId, amount, userPhone } = req.body;

        // Validate order exists
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const paymentData = await PaymentService.createPhonePePayment({
            orderId,
            amount,
            userPhone,
            redirectUrl: `${process.env.FRONTEND_URL}/payment/success`,
            callbackUrl: `${process.env.BACKEND_URL}/api/payments/phonepe/callback`
        });

        if (paymentData.success) {
            // Update order with payment details
            await Order.findByIdAndUpdate(orderId, {
                paymentStatus: 'pending',
                'paymentDetails.paymentGateway': 'phonepe',
                'paymentDetails.amount': amount,
                'paymentDetails.transactionId': paymentData.data.transactionId
            });

            res.json({
                success: true,
                data: paymentData.data
            });
        } else {
            res.status(400).json({
                success: false,
                message: paymentData.error
            });
        }
    } catch (error) {
        console.error('PhonePe payment creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Verify Razorpay Payment
router.post('/verify', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        // Verify payment signature
        const isValid = PaymentService.verifyRazorpayPayment({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        });

        if (isValid) {
            // Update order payment status
            const updateResult = await PaymentService.updateOrderPaymentStatus(orderId, {
                status: 'paid',
                method: 'upi',
                transactionId: razorpay_payment_id,
                gateway: 'razorpay',
                amount: req.body.amount,
                gatewayResponse: {
                    razorpay_order_id,
                    razorpay_payment_id,
                    razorpay_signature
                }
            });

            if (updateResult.success) {
                res.json({
                    success: true,
                    message: 'Payment verified successfully',
                    data: updateResult.data
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to update payment status'
                });
            }
        } else {
            res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// PhonePe Payment Callback
router.post('/phonepe/callback', async (req, res) => {
    try {
        const { response } = req.body;
        const decodedResponse = Buffer.from(response, 'base64').toString('utf-8');
        const responseData = JSON.parse(decodedResponse);

        const transactionId = responseData.data.merchantTransactionId;
        
        // Verify payment status
        const verificationResult = await PaymentService.verifyPhonePePayment(transactionId);
        
        if (verificationResult.success && verificationResult.data.success) {
            // Find order by transaction ID
            const order = await Order.findOne({
                'paymentDetails.transactionId': transactionId
            });

            if (order) {
                // Update payment status
                await PaymentService.updateOrderPaymentStatus(order._id, {
                    status: 'paid',
                    method: 'upi',
                    transactionId: responseData.data.transactionId,
                    gateway: 'phonepe',
                    amount: responseData.data.amount / 100, // Convert from paise
                    upiTransactionId: responseData.data.transactionId,
                    gatewayResponse: responseData
                });

                res.json({ success: true });
            } else {
                res.status(404).json({ success: false, message: 'Order not found' });
            }
        } else {
            res.status(400).json({ success: false, message: 'Payment verification failed' });
        }
    } catch (error) {
        console.error('PhonePe callback error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Check Payment Status
router.get('/status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: {
                orderId: order._id,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                amount: order.paymentDetails?.amount,
                transactionId: order.paymentDetails?.transactionId,
                paymentTimestamp: order.paymentDetails?.paymentTimestamp
            }
        });
    } catch (error) {
        console.error('Payment status check error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Generate UPI QR Code
router.post('/upi/qr-code', async (req, res) => {
    try {
        const { orderId, merchantVPA = 'nomotix@paytm', merchantName = 'Nomotix Services' } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const transactionId = PaymentService.generateTransactionId();
        const qrData = PaymentService.generateUPIQRData({
            amount: order.bill.total,
            merchantName,
            merchantVPA,
            transactionId,
            description: `Payment for ${order.serviceType} service`
        });

        // Update order with UPI transaction ID
        await Order.findByIdAndUpdate(orderId, {
            'paymentDetails.upiTransactionId': transactionId,
            'paymentDetails.upiVPA': merchantVPA
        });

        res.json({
            success: true,
            data: {
                qrData: qrData.qrData,
                upiString: qrData.upiString,
                transactionId,
                amount: order.bill.total,
                merchantVPA,
                merchantName
            }
        });
    } catch (error) {
        console.error('UPI QR code generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Process Refund
router.post('/refund', async (req, res) => {
    try {
        const { orderId, amount, reason } = req.body;

        const refundResult = await PaymentService.processRefund(orderId, {
            amount,
            reason
        });

        if (refundResult.success) {
            res.json({
                success: true,
                message: 'Refund processed successfully',
                refundId: refundResult.refundId
            });
        } else {
            res.status(400).json({
                success: false,
                message: refundResult.error
            });
        }
    } catch (error) {
        console.error('Refund processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Webhook for Razorpay
router.post('/webhook/razorpay', async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const body = JSON.stringify(req.body);

        const expectedSignature = createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(body)
            .digest('hex');

        if (signature === expectedSignature) {
            const event = req.body.event;
            const paymentData = req.body.payload.payment.entity;

            if (event === 'payment.captured') {
                // Find order and update payment status
                const order = await Order.findOne({
                    'paymentDetails.transactionId': paymentData.id
                });

                if (order) {
                    await PaymentService.updateOrderPaymentStatus(order._id, {
                        status: 'paid',
                        method: paymentData.method,
                        transactionId: paymentData.id,
                        gateway: 'razorpay',
                        amount: paymentData.amount / 100,
                        gatewayResponse: paymentData
                    });
                }
            }

            res.json({ success: true });
        } else {
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Enhanced payment routes with authentication
router.use('/v2', authenticateToken);

// New payment management routes
router.post('/v2/create-order', createPaymentOrder);
router.post('/v2/verify', verifyPayment);
router.get('/v2/history', getPaymentHistory);
router.get('/v2/:paymentId', getPaymentDetails);
router.post('/v2/:paymentId/refund', initiateRefund);

// Webhook for payment updates (no auth required)
router.post('/v2/webhook', handleWebhook);

export default router;
