import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { accessChat, fetchChats, sendMessage, allMessages } from '../controllers/chatController.js';

const router = express.Router();

// Chat creation/fetching
router.route('/').post(protect, accessChat); // Create or retrieve chat
router.route('/').get(protect, fetchChats);  // Get all my chats

// Message handling
router.route('/message').post(protect, sendMessage); // Send message
router.route('/message/:chatId').get(protect, allMessages); // Get history

export default router;