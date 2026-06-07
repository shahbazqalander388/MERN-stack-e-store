import express from 'express';
import {
  getUsers,
  deleteUser,
  toggleUserBlock,
  toggleWishlist
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, admin, getUsers);
router.route('/wishlist').post(protect, toggleWishlist);
router.route('/:id').delete(protect, admin, deleteUser);
router.route('/:id/block').put(protect, admin, toggleUserBlock);

export default router;
