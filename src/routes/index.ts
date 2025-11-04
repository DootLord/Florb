import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import florbRoutes from './florbRoutes.js';
import worldMapRoutes from './worldMapRoutes.js';
import healthRoutes from './healthRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/florbs', florbRoutes);
router.use('/world-map', worldMapRoutes);
router.use('/health', healthRoutes);

export default router;
