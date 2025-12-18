import { createHash, createHmac } from 'crypto';
import axios from 'axios';
import Order from '../models/Order.js';

// UPI Payment Service Configuration
const UPI_CONFIG = {
    // Razorpay Configuration
    RAZORPAY: {
        KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
        KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'your_key_secret',
        WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret',
        BASE_URL: 'https://api.razorpay.com/v1'
    },
    
    // PhonePe Configuration
    PHONEPE: {
        MERCHANT_ID: process.env.PHONEPE_MERCHANT_ID || 'your_merchant_id',
        SALT_KEY: process.env.PHONEPE_SALT_KEY || 'your_salt_key',
        SALT_INDEX: process.env.PHONEPE_SALT_INDEX || '1',
        BASE_URL: process.env.PHONEPE_ENV === 'production' 
            ? 'https://api.phonepe.com/apis/hermes' 
            : 'https://api-preprod.phonepe.com/apis/pg-sandbox'
    },
    
    // Paytm Configuration
    PAYTM: {
        MERCHANT_ID: process.env.PAYTM_MERCHANT_ID || 'your_merchant_id',
        MERCHANT_KEY: process.env.PAYTM_MERCHANT_KEY || 'your_merchant_key',
        BASE_URL: process.env.PAYTM_ENV === 'production'
            ? 'https://securegw.paytm.in'
            : 'https://securegw-stage.paytm.in'
    }
};

class PaymentService {
    
    // Generate unique transaction ID
    static generateTransactionId() {
        return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Create Razorpay Order
    static async createRazorpayOrder(orderData) {
        try {
            const { orderId, amount, currency = 'INR' } = orderData;
            
            const auth = Buffer.from(`${UPI_CONFIG.RAZORPAY.KEY_ID}:${UPI_CONFIG.RAZORPAY.KEY_SECRET}`).toString('base64');
            
            const response = await axios.post(`${UPI_CONFIG.RAZORPAY.BASE_URL}/orders`, {
                amount: amount * 100, // Convert to paise
                currency,
                receipt: orderId,
                payment_capture: 1,
                notes: {
                    order_id: orderId,
                    service_type: orderData.serviceType || 'vehicle_service'
                }
            }, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Razorpay order creation failed:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.description || 'Payment order creation failed'
            };
        }
    }

    // Create PhonePe Payment
    static async createPhonePePayment(orderData) {
        try {
            const { orderId, amount, userPhone, redirectUrl, callbackUrl } = orderData;
            
            const transactionId = this.generateTransactionId();
            const payload = {
                merchantId: UPI_CONFIG.PHONEPE.MERCHANT_ID,
                merchantTransactionId: transactionId,
                merchantUserId: `USER_${Date.now()}`,
                amount: amount * 100, // Convert to paise
                redirectUrl: redirectUrl || `${process.env.FRONTEND_URL}/payment/success`,
                redirectMode: 'POST',
                callbackUrl: callbackUrl || `${process.env.BACKEND_URL}/api/payments/phonepe/callback`,
                mobileNumber: userPhone,
                paymentInstrument: {
                    type: 'PAY_PAGE'
                }
            };

            const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
            const checksum = createHash('sha256')
                .update(base64Payload + '/pg/v1/pay' + UPI_CONFIG.PHONEPE.SALT_KEY)
                .digest('hex') + '###' + UPI_CONFIG.PHONEPE.SALT_INDEX;

            const response = await axios.post(`${UPI_CONFIG.PHONEPE.BASE_URL}/pg/v1/pay`, {
                request: base64Payload
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum
                }
            });

            return {
                success: true,
                data: {
                    ...response.data,
                    transactionId
                }
            };
        } catch (error) {
            console.error('PhonePe payment creation failed:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Payment creation failed'
            };
        }
    }

    // Verify Razorpay Payment
    static verifyRazorpayPayment(paymentData) {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;
            
            const body = razorpay_order_id + '|' + razorpay_payment_id;
            const expectedSignature = createHmac('sha256', UPI_CONFIG.RAZORPAY.KEY_SECRET)
                .update(body.toString())
                .digest('hex');

            return expectedSignature === razorpay_signature;
        } catch (error) {
            console.error('Razorpay verification failed:', error);
            return false;
        }
    }

    // Verify PhonePe Payment
    static async verifyPhonePePayment(transactionId) {
        try {
            const checksum = createHash('sha256')
                .update(`/pg/v1/status/${UPI_CONFIG.PHONEPE.MERCHANT_ID}/${transactionId}` + UPI_CONFIG.PHONEPE.SALT_KEY)
                .digest('hex') + '###' + UPI_CONFIG.PHONEPE.SALT_INDEX;

            const response = await axios.get(
                `${UPI_CONFIG.PHONEPE.BASE_URL}/pg/v1/status/${UPI_CONFIG.PHONEPE.MERCHANT_ID}/${transactionId}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-VERIFY': checksum,
                        'X-MERCHANT-ID': UPI_CONFIG.PHONEPE.MERCHANT_ID
                    }
                }
            );

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('PhonePe verification failed:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Payment verification failed'
            };
        }
    }

    // Update Order Payment Status
    static async updateOrderPaymentStatus(orderId, paymentData) {
        try {
            const updateData = {
                paymentStatus: paymentData.status,
                paymentMethod: paymentData.method,
                'paymentDetails.transactionId': paymentData.transactionId,
                'paymentDetails.paymentGateway': paymentData.gateway,
                'paymentDetails.amount': paymentData.amount,
                'paymentDetails.paymentTimestamp': new Date(),
                'paymentDetails.gatewayResponse': paymentData.gatewayResponse
            };

            if (paymentData.upiTransactionId) {
                updateData['paymentDetails.upiTransactionId'] = paymentData.upiTransactionId;
            }

            if (paymentData.upiVPA) {
                updateData['paymentDetails.upiVPA'] = paymentData.upiVPA;
            }

            const updatedOrder = await Order.findByIdAndUpdate(
                orderId,
                updateData,
                { new: true }
            );

            return {
                success: true,
                data: updatedOrder
            };
        } catch (error) {
            console.error('Order payment status update failed:', error);
            return {
                success: false,
                error: 'Failed to update payment status'
            };
        }
    }

    // Process Refund
    static async processRefund(orderId, refundData) {
        try {
            const order = await Order.findById(orderId);
            if (!order) {
                return { success: false, error: 'Order not found' };
            }

            const { amount, reason } = refundData;
            const refundId = 'REFUND_' + Date.now();

            // Process refund based on payment gateway
            let refundResponse;
            if (order.paymentDetails.paymentGateway === 'razorpay') {
                refundResponse = await this.processRazorpayRefund(order.paymentDetails.transactionId, amount);
            } else if (order.paymentDetails.paymentGateway === 'phonepe') {
                refundResponse = await this.processPhonePeRefund(order.paymentDetails.transactionId, amount);
            }

            if (refundResponse.success) {
                // Update order with refund details
                await Order.findByIdAndUpdate(orderId, {
                    paymentStatus: 'refunded',
                    'paymentDetails.refundDetails': {
                        refundId,
                        refundAmount: amount,
                        refundStatus: 'processed',
                        refundTimestamp: new Date(),
                        refundReason: reason
                    }
                });

                return { success: true, refundId };
            } else {
                return { success: false, error: refundResponse.error };
            }
        } catch (error) {
            console.error('Refund processing failed:', error);
            return { success: false, error: 'Refund processing failed' };
        }
    }

    // Process Razorpay Refund
    static async processRazorpayRefund(paymentId, amount) {
        try {
            const auth = Buffer.from(`${UPI_CONFIG.RAZORPAY.KEY_ID}:${UPI_CONFIG.RAZORPAY.KEY_SECRET}`).toString('base64');
            
            const response = await axios.post(`${UPI_CONFIG.RAZORPAY.BASE_URL}/payments/${paymentId}/refund`, {
                amount: amount * 100, // Convert to paise
                speed: 'normal'
            }, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                }
            });

            return { success: true, data: response.data };
        } catch (error) {
            console.error('Razorpay refund failed:', error.response?.data || error.message);
            return { success: false, error: 'Refund processing failed' };
        }
    }

    // Generate UPI QR Code Data
    static generateUPIQRData(paymentData) {
        const { amount, merchantName, merchantVPA, transactionId, description } = paymentData;
        
        const upiString = `upi://pay?pa=${merchantVPA}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(description)}&tr=${transactionId}`;
        
        return {
            upiString,
            qrData: upiString
        };
    }
}

export default PaymentService;
