import express from 'express';
import { loginUser, registerUser, resendOtp, verifyEmail } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-otp', verifyEmail);
router.post('/login', loginUser);
router.post('/resend-otp', resendOtp);

export default router;