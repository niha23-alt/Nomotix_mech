import express from "express";
import {
  addReview,
  getReviewsByGarage,
  getReviewsForService,
  createOrderReview,
  canReviewOrder,
  getCustomerReviews,
  getGarageStats
} from "../controllers/reviewController.js";

const router = express.Router();

// Original routes
router.post('/', addReview);
router.get('/garage/:garageId', getReviewsByGarage);
router.get('/garage/:garageId/service/:serviceId', getReviewsForService);

// Enhanced rating system routes
router.post('/order', createOrderReview);
router.get('/can-review/:orderId', canReviewOrder);
router.get('/customer/:customerId', getCustomerReviews);
router.get('/stats/:garageId', getGarageStats);

export default router;