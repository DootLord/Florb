import { Router } from 'express';
import userRoutes from './userRoutes.js';
import florbRoutes from './florbRoutes.js';

const router = Router();

console.log('Loading routes...');
console.log('userRoutes:', typeof userRoutes);
console.log('florbRoutes:', typeof florbRoutes);

router.use('/users', userRoutes);
router.use('/florbs', florbRoutes);
console.log('Routes loaded successfully');

export default router;
