import express from 'express';
import { loginUser, registerUser, getUserProfile, getUsers } from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes
router.post('/login', loginUser);
router.post('/register', protect, admin, registerUser); // Only admin can register new users
router.get('/profile', protect, getUserProfile);
router.get('/users', protect, admin, getUsers);

export default router;
