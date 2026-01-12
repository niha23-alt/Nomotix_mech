// Test script to check garage ID in localStorage and validate it against the backend
import axios from 'axios';

const testGarageId = async () => {
  // Check localStorage for garage_id
  const garageId = localStorage.getItem('garage_id');
  console.log('Current garage_id in localStorage:', garageId);
  
  if (!garageId) {
    console.log('No garage_id found in localStorage. Please sign in or register first.');
    return;
  }
  
  // Try to fetch the garage from the backend
  try {
    const response = await axios.get(`http://localhost:5001/api/garages/${garageId}`);
    console.log('Garage found:', response.data);
  } catch (error) {
    console.error('Error fetching garage:', error);
    
    // If garage not found, clear localStorage
    if (error.response && error.response.status === 404) {
      console.log('Garage not found in database. Clearing invalid garage_id from localStorage.');
      localStorage.removeItem('garage_id');
      localStorage.removeItem('mechanic_registered');
      localStorage.removeItem('mechanic_verified');
    }
  }
};

testGarageId();
