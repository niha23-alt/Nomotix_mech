import axios from 'axios';

// Replace with a valid garage ID from your database
const GARAGE_ID = '678c8a123456789012345678';

async function testAllOrders() {
  try {
    // Test without status filter to get all orders
    const response = await axios.get(`http://localhost:5001/api/orders/garage/${GARAGE_ID}`);
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    if (response.data.orders) {
      console.log(`Number of all orders: ${response.data.orders.length}`);
      console.log('Orders:', JSON.stringify(response.data.orders, null, 2));
      
      // Count orders by status
      const statusCount = response.data.orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});
      console.log('Orders by status:', statusCount);
    } else {
      console.log('No orders found in response');
    }
  } catch (error) {
    console.error('Error fetching all orders:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testAllOrders();
