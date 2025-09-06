import { Router } from 'express';
import { FlorbController } from '../controllers/FlorbController.js';

const router = Router();
const florbController = new FlorbController();

// Generation routes
router.post('/generate', florbController.generateFlorb);
router.post('/generate/batch', florbController.batchGenerateFlorbs);

// CRUD routes
router.post('/', florbController.createFlorb);
router.get('/', florbController.getAllFlorbs);
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

export default router;
