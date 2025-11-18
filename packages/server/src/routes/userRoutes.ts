import { Router } from 'express';
import UserController from '../controllers/UserController.js';
import { AuthMiddleware } from '../middleware/AuthMiddleware.js';

const router = Router();
const authMiddleware = new AuthMiddleware();

// User dashboard endpoints (require authentication)
router.get('/stats', authMiddleware.authenticate, UserController.getUserStats);
router.get('/florbs', authMiddleware.authenticate, UserController.getUserFlorbs);

// Legacy user management endpoints (may not need authentication for all)
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);

export default router;
