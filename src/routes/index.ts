import { Router } from 'express';
import userRoutes from './userRoutes.js';
import florbRoutes from './florbRoutes.js';

const router = Router();

router.use('/users', userRoutes);
router.use('/florbs', florbRoutes);

export default router;
