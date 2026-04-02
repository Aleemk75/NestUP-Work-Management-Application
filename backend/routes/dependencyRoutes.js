import express from 'express';
import { getDependencies, createDependency, deleteDependency } from '../controllers/dependencyController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getDependencies);
router.post('/', protect, admin, createDependency);
router.delete('/:id', protect, admin, deleteDependency);

export default router;
