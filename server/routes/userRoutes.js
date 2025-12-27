import express from 'express';
import { 
    getUserProfile, 
    updateUserProfile, 
    toggleWishlist, 
    getWishlist 
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Profile Routes ---
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// --- Wishlist Routes ---
router.route('/wishlist')
    .post(protect, toggleWishlist) // Add or Remove item
    .get(protect, getWishlist);    // View all items

export default router;