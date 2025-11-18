import { Router } from 'express';
import { WorldMapController } from '../controllers/WorldMapController.js';
import { AuthMiddleware } from '../middleware/AuthMiddleware.js';

const router = Router();
const worldMapController = new WorldMapController();
const authMiddleware = new AuthMiddleware();

// GET /api/world-map/florbs - Get all placed Florbs for the current user
router.get('/florbs', authMiddleware.authenticate, (req, res) => worldMapController.getPlacedFlorbs(req, res));

// POST /api/world-map/florbs - Place a new Florb on the map
router.post('/florbs', authMiddleware.authenticate, (req, res) => worldMapController.placeFlorb(req, res));

// PUT /api/world-map/florbs - Update all placed Florbs (bulk)
router.put('/florbs', authMiddleware.authenticate, (req, res) => worldMapController.updatePlacedFlorbs(req, res));

// GET /api/world-map/resources - Get all resource nodes
router.get('/resources', authMiddleware.authenticate, (req, res) => worldMapController.getResourceNodes(req, res));

// PUT /api/world-map/resources - Update all resource nodes
router.put('/resources', authMiddleware.authenticate, (req, res) => worldMapController.updateResourceNodes(req, res));

// GET /api/world-map/player-resources - Get current player resources
router.get('/player-resources', authMiddleware.authenticate, (req, res) => worldMapController.getPlayerResources(req, res));

// PUT /api/world-map/player-resources - Update player resources
router.put('/player-resources', authMiddleware.authenticate, (req, res) => worldMapController.updatePlayerResources(req, res));

// POST /api/world-map/gather - Record gathering activity
router.post('/gather', authMiddleware.authenticate, (req, res) => worldMapController.recordGathering(req, res));

// Development/Testing endpoints
// POST /api/world-map/generate-resources - Generate dummy resource nodes
router.post('/generate-resources', authMiddleware.authenticate, (req, res) => worldMapController.generateResourceNodes(req, res));

// GET /api/world-map/export-resources - Export resource data
router.get('/export-resources', authMiddleware.authenticate, (req, res) => worldMapController.exportResourceData(req, res));

export default router;