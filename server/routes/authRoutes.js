import express from 'express';
import { loginUser, registerUser, verifyEmail } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-otp', verifyEmail);
router.post('/login', loginUser);

export default router;