import { Router } from 'express';
import { FlorbController } from '../controllers/FlorbController.js';

const router = Router();

console.log('Creating FlorbController...');
const florbController = new FlorbController();
console.log('FlorbController created successfully');

// Generation routes
console.log('Registering generation routes...');
router.get('/test', (req, res) => {
  res.json({ message: 'Florb routes are working!', timestamp: new Date().toISOString() });
});
router.post('/generate', (req, res) => florbController.generateFlorb(req, res));
router.post('/generate/batch', (req, res) => florbController.batchGenerateFlorbs(req, res));

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
router.get('/meta/base-images', florbController.getBaseImages);

export default router;
