import express from 'express';
import { getWorkItems, createWorkItem, updateWorkItem, deleteWorkItem } from '../controllers/workItemController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getWorkItems);
router.post('/', protect, admin, createWorkItem);
router.put('/:id', protect, updateWorkItem);
router.delete('/:id', protect, admin, deleteWorkItem);

export default router;
