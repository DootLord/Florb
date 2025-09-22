import { Router } from 'express';
import { FlorbController } from '../controllers/FlorbController.js';
import { AuthMiddleware } from '../middleware/AuthMiddleware.js';

const router = Router();
const florbController = new FlorbController();
const authMiddleware = new AuthMiddleware();

// Generation routes (require authentication)
router.post('/generate', authMiddleware.authenticate, florbController.generateFlorb);
router.post('/generate/batch', authMiddleware.authenticate, florbController.batchGenerateFlorbs);

// CRUD routes
router.post('/', florbController.createFlorb);
router.get('/', authMiddleware.authenticate, florbController.getUserFlorbs); // Changed to get user's florbs
router.get('/:id', florbController.getFlorbById);
router.put('/:id', florbController.updateFlorb);
router.delete('/:id', florbController.deleteFlorb);

// Lookup routes
router.get('/florb-id/:florbId', florbController.getFlorbByFlorbId);
router.get('/rarity/:rarity', florbController.getFlorbsByRarity);
router.get('/effect/:effect', florbController.getFlorbsWithEffect);

// Statistics and metadata routes
router.get('/stats/rarity', florbController.getRarityStats);
router.get('/meta/rarities', florbController.getRarityLevels);
router.get('/meta/effects', florbController.getSpecialEffects);
router.get('/meta/base-images', florbController.getBaseImages);
router.get('/meta/rarity-names', florbController.getRarityNameMappings);

export default router;
