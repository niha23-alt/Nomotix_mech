import axios from 'axios';

// Replace with a valid garage ID from your database
const GARAGE_ID = '678c8a123456789012345678';

async function testCompletedBookings() {
  try {
    const response = await axios.get(`http://localhost:5001/api/orders/garage/${GARAGE_ID}?status=completed`);
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    if (response.data.orders) {
      console.log(`Number of completed bookings: ${response.data.orders.length}`);
      console.log('Bookings:', JSON.stringify(response.data.orders, null, 2));
    } else {
      console.log('No orders found in response');
    }
  } catch (error) {
    console.error('Error fetching completed bookings:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testCompletedBookings();
