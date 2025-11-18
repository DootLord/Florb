import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import florbRoutes from './florbRoutes.js';
import worldMapRoutes from './worldMapRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/florbs', florbRoutes);
router.use('/world-map', worldMapRoutes);

export default router;
