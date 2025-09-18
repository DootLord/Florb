import { Router } from 'express';
import userRoutes from './userRoutes.js';
import florbRoutes from './florbRoutes.js';
import worldMapRoutes from './worldMapRoutes.js';

const router = Router();

router.use('/users', userRoutes);
router.use('/florbs', florbRoutes);
router.use('/world-map', worldMapRoutes);

export default router;
