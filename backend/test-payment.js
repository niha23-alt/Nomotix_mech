// Simple test script to verify payment API endpoints
import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api';

// Test data
const testOrder = {
  _id: '507f1f77bcf86cd799439011',
  bill: { total: 500 },
  serviceType: 'breakdown',
  Customer: { name: 'Test User', email: 'test@example.com' },
  breakdownDetails: { contactNumber: '9999999999' }
};

async function testPaymentEndpoints() {
  console.log('🧪 Testing Payment API Endpoints...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    const healthResponse = await axios.get(`${BASE_URL.replace('/api', '')}/`);
    console.log('✅ Server is running:', healthResponse.data);

    // Test 2: Test UPI QR Code generation
    console.log('\n2. Testing UPI QR Code generation...');
    try {
      const qrResponse = await axios.post(`${BASE_URL}/payments/upi/qr-code`, {
        orderId: testOrder._id,
        merchantVPA: 'test@paytm',
        merchantName: 'Test Merchant'
      });
      console.log('✅ UPI QR Code generated successfully');
      console.log('QR Data:', qrResponse.data.data?.qrData?.substring(0, 50) + '...');
    } catch (error) {
      console.log('❌ UPI QR Code generation failed:', error.response?.data?.message || error.message);
    }

    // Test 3: Test payment status check (should fail gracefully)
    console.log('\n3. Testing payment status check...');
    try {
      const statusResponse = await axios.get(`${BASE_URL}/payments/status/${testOrder._id}`);
      console.log('✅ Payment status check works');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Payment status check works (order not found as expected)');
      } else {
        console.log('❌ Payment status check failed:', error.response?.data?.message || error.message);
      }
    }

    // Test 4: Test Razorpay order creation (will fail without valid credentials)
    console.log('\n4. Testing Razorpay order creation...');
    try {
      const razorpayResponse = await axios.post(`${BASE_URL}/payments/create-order`, {
        orderId: testOrder._id,
        amount: testOrder.bill.total,
        currency: 'INR'
      });
      console.log('✅ Razorpay order creation works');
    } catch (error) {
      if (error.response?.data?.message?.includes('Order not found')) {
        console.log('✅ Razorpay endpoint works (order validation working)');
      } else {
        console.log('⚠️ Razorpay order creation failed (expected without valid credentials):', 
                   error.response?.data?.message || error.message);
      }
    }

    console.log('\n🎉 Payment API testing completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Add valid Razorpay credentials to .env file');
    console.log('2. Create test orders in database');
    console.log('3. Test with real payment flows');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testPaymentEndpoints();
