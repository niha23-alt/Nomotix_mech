import express from 'express';
import { requestEmergency } from '../controllers/emergencyController.js';
import { authenticateToken } from '../middleware/auth.js'; // Assuming authentication is needed

const router = express.Router();

// Route to request an emergency service
router.post('/request', authenticateToken, requestEmergency);

export default router;
