import express from 'express';
import { getAdminStats, getMemberStats } from '../controllers/dashboardController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/admin', protect, admin, getAdminStats);
router.get('/member', protect, getMemberStats);

export default router;
