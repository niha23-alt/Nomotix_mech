import express from 'express';
import {
  addCar,
  getUserCars,
  getCar,
  updateCar,
  deleteCar,
  uploadCarImage,
  deleteCarImage,
  uploadMiddleware
} from '../controllers/carController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All car routes require authentication
router.use(authenticateToken);

// Car CRUD operations
router.post('/', addCar);
router.get('/', getUserCars);
router.get('/:carId', getCar);
router.put('/:carId', updateCar);
router.delete('/:carId', deleteCar);

// Car image operations
router.post('/:carId/images', uploadMiddleware, uploadCarImage);
router.delete('/:carId/images/:imageId', deleteCarImage);

export default router;
