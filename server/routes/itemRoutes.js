import express from 'express';
import multer from 'multer';
import { storage } from '../utils/cloudinaryConfig.js';
import { protect } from '../middleware/authMiddleware.js';
import { createItem, deleteItem, getItemById, getItems, getMyItems, updateItemStatus } from '../controllers/itemController.js';

const router = express.Router();
const upload = multer({ storage });

// 1. Post a new item (Protected: User must be logged in)
// 'image' is the name of the field we will use in Postman
router.post('/', protect, upload.single('image'), createItem);

// 2. Get all items (Public: Anyone can browse the marketplace)
router.get('/', getItems);

// Get only my items
router.get('/my-items', protect, getMyItems);

router.get('/:id', getItemById);

// Delete an item
router.delete('/:id', protect, deleteItem);

// Update item status
router.patch('/:id', protect, updateItemStatus);

export default router;