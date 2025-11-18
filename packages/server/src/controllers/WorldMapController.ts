import { Request, Response } from 'express';
import { WorldMapService } from '../services/WorldMapService.js';

export class WorldMapController {
    private worldMapService: WorldMapService;

    constructor() {
        this.worldMapService = new WorldMapService();
    }

    // GET /api/world-map/florbs - Get all placed Florbs for the current user
    async getPlacedFlorbs(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Authentication required' });
                return;
            }

            const userId = req.user.userId;
            const florbs = await this.worldMapService.getPlacedFlorbs(userId);
            res.json({ florbs });
        } catch (error) {
            console.error('Error getting placed florbs:', error);
            res.status(500).json({ error: 'Failed to fetch Florbs' });
        }
    }

    // POST /api/world-map/florbs - Place a new Florb on the map
    async placeFlorb(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Authentication required' });
                return;
            }

            const userId = req.user.userId;
            const { florbData, position } = req.body;

            if (!florbData || !position) {
                res.status(400).json({ error: 'Missing florbData or position' });
                return;
            }

            const placedFlorb = await this.worldMapService.placeFlorb(userId, florbData, position);
            res.status(201).json(placedFlorb);
        } catch (error) {
            console.error('Error placing florb:', error);
            res.status(500).json({ error: 'Failed to place Florb' });
        }
    }

    // PUT /api/world-map/florbs - Update all placed Florbs (bulk)
    async updatePlacedFlorbs(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Authentication required' });
                return;
            }

            const userId = req.user.userId;
            const updates = req.body;

            if (!Array.isArray(updates)) {
                res.status(400).json({ error: 'Updates must be an array' });
                return;
            }

            const result = await this.worldMapService.updatePlacedFlorbs(userId, updates);
            res.json(result);
        } catch (error) {
            console.error('Error updating placed florbs:', error);
            res.status(500).json({ error: 'Failed to update Florbs' });
        }
    }

    // GET /api/world-map/resources - Get all resource nodes
    async getResourceNodes(_req: Request, res: Response): Promise<void> {
        try {
            const resources = await this.worldMapService.getAllResourceNodes();
            res.json(resources);
        } catch (error) {
            console.error('Error getting resource nodes:', error);
            res.status(500).json({ error: 'Failed to fetch resources' });
        }
    }

    // PUT /api/world-map/resources - Update all resource nodes
    async updateResourceNodes(req: Request, res: Response): Promise<void> {
        try {
            const updates = req.body;

            if (!Array.isArray(updates)) {
                res.status(400).json({ error: 'Updates must be an array' });
                return;
            }

            const result = await this.worldMapService.updateResourceNodes(updates);
            res.json(result);
        } catch (error) {
            console.error('Error updating resource nodes:', error);
            res.status(500).json({ error: 'Failed to update resources' });
        }
    }

    // GET /api/world-map/player-resources - Get current player resources
    async getPlayerResources(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Authentication required' });
                return;
            }

            const userId = req.user.userId;
            const resources = await this.worldMapService.getPlayerResources(userId);
            res.json({
                resources: {
                    crystal: resources.crystal,
                    energy: resources.energy,
                    metal: resources.metal
                }
            });
        } catch (error) {
            console.error('Error getting player resources:', error);
            res.status(500).json({ error: 'Failed to fetch player resources' });
        }
    }

    // PUT /api/world-map/player-resources - Update player resources
    async updatePlayerResources(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Authentication required' });
                return;
            }

            const userId = req.user.userId;
            const { crystal, energy, metal } = req.body;

            if (typeof crystal !== 'number' || typeof energy !== 'number' || typeof metal !== 'number') {
                res.status(400).json({ error: 'Invalid resource values' });
                return;
            }

            const updatedResources = await this.worldMapService.updatePlayerResources(userId, { crystal, energy, metal });
            res.json({
                success: true,
                totalResources: {
                    crystal: updatedResources.crystal,
                    energy: updatedResources.energy,
                    metal: updatedResources.metal
                }
            });
        } catch (error) {
            console.error('Error updating player resources:', error);
            res.status(500).json({ error: 'Failed to update player resources' });
        }
    }

    // POST /api/world-map/gather - Record gathering activity
    async recordGathering(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Authentication required' });
                return;
            }

            const userId = req.user.userId;
            const { resourceId, amount } = req.body;

            if (!resourceId || typeof amount !== 'number') {
                res.status(400).json({ error: 'Missing resourceId or invalid amount' });
                return;
            }

            // For now, just record the gathering - we'll need to update the service to handle this properly
            const gathered = { crystal: amount, energy: 0, metal: 0 }; // TODO: Determine resource type from resourceId
            const timestamp = new Date().toISOString();

            await this.worldMapService.recordGatheringAnalytics(userId, gathered, timestamp);

            // Get updated resources
            const updatedResources = await this.worldMapService.getPlayerResources(userId);

            res.json({
                success: true,
                gathered: { crystal: amount },
                totalResources: {
                    crystal: updatedResources.crystal,
                    energy: updatedResources.energy,
                    metal: updatedResources.metal
                }
            });
        } catch (error) {
            console.error('Error recording gathering:', error);
            res.status(500).json({ error: 'Failed to record gathering' });
        }
    }

    // POST /api/world-map/generate-resources - Generate dummy resource nodes
    async generateResourceNodes(req: Request, res: Response): Promise<void> {
        try {
            const { count } = req.body;
            const nodeCount = count ? parseInt(count as string) : 100;
            const nodes = await this.worldMapService.generateResourceNodes(nodeCount);
            res.status(201).json({
                success: true,
                generated: nodes.length,
                nodes: nodes
            });
        } catch (error) {
            console.error('Error generating resource nodes:', error);
            res.status(500).json({ error: 'Failed to generate resource nodes' });
        }
    }

    // GET /api/world-map/export-resources - Export resource data
    async exportResourceData(_req: Request, res: Response): Promise<void> {
        try {
            const data = await this.worldMapService.exportResourceData();
            res.json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error('Error exporting resource data:', error);
            res.status(500).json({ error: 'Failed to export resource data' });
        }
    }
}