// Example: How to send service data from frontend to backend

// This file demonstrates the complete data flow for adding a service

import axios from 'axios';

// Example 1: Adding a new service to the database
const addNewServiceToDatabase = async (serviceData) => {
  try {
    // 1. Frontend collects service data (from form inputs)
    // serviceData = {
    //   name: "Oil Change",
    //   basePrice: 500,
    //   description: "Complete oil change with filter replacement",
    //   defaultDuration: 30
    // };
    
    // 2. Frontend sends POST request to backend API
    const response = await axios.post(
      'http://localhost:5001/api/services',
      serviceData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    // 3. Backend processes the request:
    //    - Validates required fields (name, basePrice)
    //    - Creates service object
    //    - Saves to MongoDB database
    //    - Returns success response with saved data
    
    // 4. Frontend handles the response
    if (response.data.success) {
      console.log('Service added successfully:', response.data.data);
      // Update UI with new service
    } else {
      console.error('Failed to add service:', response.data.message);
      // Show error to user
    }
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    // Handle network errors
    throw error;
  }
};

// Example 2: Adding a service to a specific garage
const addServiceToGarage = async (garageId, serviceData) => {
  try {
    // Get garageId from localStorage or context
    // const garageId = localStorage.getItem('garage_id');
    
    // 1. Frontend collects service data for a specific garage
    // serviceData = {
    //   serviceName: "Brake Service",
    //   price: 1200,
    //   description: "Complete brake inspection and pad replacement",
    //   duration: 60
    // };
    
    // 2. Frontend sends POST request to backend API
    const response = await axios.post(
      `http://localhost:5001/api/garages/${garageId}/services`,
      serviceData,
      {
        headers: {
          'Content-Type': 'application/json',
          // Include authorization token if required
          // 'Authorization': `Bearer ${token}`
        }
      }
    );
    
    // 3. Backend processes the request:
    //    - Validates required fields
    //    - Checks if service exists, creates if not
    //    - Adds service to garage with custom pricing
    //    - Returns updated garage data
    
    // 4. Frontend handles the response
    if (response.data.success) {
      console.log('Service added to garage successfully:', response.data.data);
      // Update UI with updated garage services
    } else {
      console.error('Failed to add service to garage:', response.data.message);
      // Show error to user
    }
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Example 3: Getting all services
const getAllServices = async () => {
  try {
    const response = await axios.get('http://localhost:5001/api/services');
    
    if (response.data.success) {
      console.log('Services retrieved successfully:', response.data.data);
      // Use services data in UI
    }
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export {
  addNewServiceToDatabase,
  addServiceToGarage,
  getAllServices
};

// Data Flow Diagram:
// 1. USER: Fills out "Add Service" form in browser
// 2. FRONTEND: Validates form inputs locally
// 3. FRONTEND: Collects form data into JavaScript object
// 4. FRONTEND: Sends POST request to backend API endpoint
// 5. BACKEND: Receives request and validates data
// 6. BACKEND: Creates Service document in MongoDB
// 7. BACKEND: Returns JSON response with status and data
// 8. FRONTEND: Receives response and updates UI
// 9. USER: Sees confirmation message and updated services list