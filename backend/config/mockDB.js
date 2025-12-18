// Mock Database for Development
// This will work without MongoDB connection

class MockDB {
  constructor() {
    this.users = [
      {
        _id: "665fabc1234567890abcde01",
        name: "Test User",
        email: "test@example.com",
        password: "$2a$10$example.hash.for.password123", // bcrypt hash for "password123"
        phone: "9876543210",
        address: "Test Address, Bangalore"
      }
    ];
    
    this.garages = [
      {
        _id: "garage1",
        name: "Quick Fix Garage",
        location: {
          type: "Point",
          coordinates: [77.5946, 12.9716], // [lng, lat] for Bangalore
          address: "MG Road, Bangalore"
        },
        services: ["Engine Repair", "Oil Change", "Brake Service"],
        rating: 4.5
      },
      {
        _id: "garage2", 
        name: "Auto Care Center",
        location: {
          type: "Point",
          coordinates: [77.6033, 12.9698],
          address: "Brigade Road, Bangalore"
        },
        services: ["AC Repair", "Battery Service", "Tire Change"],
        rating: 4.2
      }
    ];
    
    this.orders = [];
    this.reviews = [];
    this.services = [
      {
        _id: "service1",
        name: "Engine Repair",
        basePrice: 2500,
        category: "Engine"
      },
      {
        _id: "service2", 
        name: "Oil Change",
        basePrice: 800,
        category: "Maintenance"
      },
      {
        _id: "service3",
        name: "Brake Service", 
        basePrice: 1500,
        category: "Safety"
      }
    ];
  }

  // User operations
  findUser(query) {
    if (query.email) {
      return this.users.find(user => user.email === query.email);
    }
    if (query._id) {
      return this.users.find(user => user._id === query._id);
    }
    return null;
  }

  createUser(userData) {
    const newUser = {
      _id: "user_" + Date.now(),
      ...userData,
      createdAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  // Garage operations
  findGarages(query = {}) {
    return this.garages;
  }

  findNearbyGarages(lat, lng, radius = 5000) {
    // Simple distance calculation (for demo)
    return this.garages.filter(garage => {
      const [gLng, gLat] = garage.location.coordinates;
      const distance = Math.sqrt(
        Math.pow(lat - gLat, 2) + Math.pow(lng - gLng, 2)
      ) * 111000; // rough conversion to meters
      return distance <= radius;
    });
  }

  // Order operations
  createOrder(orderData) {
    const newOrder = {
      _id: "order_" + Date.now(),
      ...orderData,
      createdAt: new Date(),
      status: orderData.status || "pending"
    };
    this.orders.push(newOrder);
    return newOrder;
  }

  findOrders(query = {}) {
    if (query.Customer) {
      return this.orders.filter(order => order.Customer === query.Customer);
    }
    return this.orders;
  }

  // Service operations
  findServices(query = {}) {
    return this.services;
  }

  // Review operations
  findReviews(query = {}) {
    return this.reviews.filter(review => {
      if (query.garage && review.garage !== query.garage) return false;
      if (query.service && review.service !== query.service) return false;
      return true;
    });
  }

  createReview(reviewData) {
    const newReview = {
      _id: "review_" + Date.now(),
      ...reviewData,
      createdAt: new Date()
    };
    this.reviews.push(newReview);
    return newReview;
  }
}

// Create singleton instance
const mockDB = new MockDB();

export default mockDB;
