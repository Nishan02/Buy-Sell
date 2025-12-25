import express from 'express';
import multer from 'multer';
import { storage } from '../utils/cloudinaryConfig.js';
import { protect } from '../middleware/authMiddleware.js';
import { createItem, deleteItem, getItemById, getItems, getMyItems, getMyListings, toggleSoldStatus} from '../controllers/itemController.js';

const router = express.Router();
const upload = multer({ storage });

// 1. Post a new item (Protected: User must be logged in)
// 'image' is the name of the field we will use in Postman
router.post('/', protect, upload.single('image'), createItem);

// 2. Get all items (Public: Anyone can browse the marketplace)
router.get('/', getItems);

// Get only my items
router.get('/my-items', protect, getMyItems);

router.get('/my-listings', protect, getMyListings);

router.get('/:id', getItemById);

// Delete an item
router.delete('/:id', protect, deleteItem);

// Toggle sold status of an item
router.patch('/:id/status', protect, toggleSoldStatus);

export default router;