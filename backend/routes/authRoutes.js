import express from 'express';
import {
  signup,
  login,
  googleAuth,
  verifyEmail,
  resendVerificationEmail,
  completeSignup
} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/verify-email', verifyEmail); // Changed to GET for URL verification
router.post('/verify-email', verifyEmail); // Keep POST for backward compatibility
router.post('/complete-signup', completeSignup);
router.post('/resend-verification', resendVerificationEmail);

export default router;