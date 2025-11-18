import type { Request, Response } from 'express';
import UserService from '../services/UserService.js';
import { FlorbService } from '../services/FlorbService.js';
import { WorldMapService } from '../services/WorldMapService.js';
import BaseController from './BaseController.js';

class UserController extends BaseController {
    private userService: UserService;
    private florbService: FlorbService;
    private worldMapService: WorldMapService;

    constructor() {
        super();
        this.userService = new UserService();
        this.florbService = new FlorbService();
        this.worldMapService = new WorldMapService();
        
        // Bind methods to preserve 'this' context
        this.getAllUsers = this.getAllUsers.bind(this);
        this.getUserById = this.getUserById.bind(this);
        this.createUser = this.createUser.bind(this);
        this.getUserStats = this.getUserStats.bind(this);
        this.getUserFlorbs = this.getUserFlorbs.bind(this);
    }

    async getAllUsers(_req: Request, res: Response): Promise<void> {
        try {
            const users = await this.userService.getAllUsers();
            this.handleSuccess(res, users);
        } catch (error) {
            this.handleError(res, error, 'Failed to get users');
        }
    }

    async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            
            if (!id) {
                res.status(400).json({ error: 'User ID is required' });
                return;
            }
            
            const user = await this.userService.getUserById(id);
            
            if (user) {
                this.handleSuccess(res, user);
            } else {
                this.handleNotFound(res, 'User not found');
            }
        } catch (error) {
            this.handleError(res, error, 'Failed to get user');
        }
    }

    async createUser(req: Request, res: Response): Promise<void> {
        try {
            const user = await this.userService.createUser(req.body);
            this.handleSuccess(res, user, 'User created successfully');
        } catch (error) {
            // Handle Zod validation errors
            if (error instanceof Error && error.name === 'ZodError') {
                res.status(400).json({ 
                    error: 'Validation failed', 
                    details: JSON.parse(error.message) 
                });
                return;
            }
            this.handleError(res, error, 'Failed to create user');
        }
    }

    // GET /api/user/stats - Get user statistics for dashboard
    async getUserStats(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Authentication required' });
                return;
            }

            const userId = req.user.userId;

            // Get real stats
            const [totalFlorbs, rareFlorbs, playerResources, placedFlorbs] = await Promise.all([
                this.florbService.getUserFlorbCount(userId),
                this.florbService.getUserRareFlorbCount(userId),
                this.worldMapService.getPlayerResources(userId),
                this.worldMapService.getPlacedFlorbCount(userId)
            ]);

            const stats = {
                totalFlorbs,
                rareFlorbs,
                totalGathered: {
                    Shleep: playerResources.crystal,
                    Mlorp: playerResources.energy,
                    Spoonch: playerResources.metal
                },
                placedFlorbs
            };

            this.handleSuccess(res, stats);
        } catch (error) {
            this.handleError(res, error, 'Failed to get user stats');
        }
    }

    // GET /api/user/florbs - Get recent florbs for user dashboard
    async getUserFlorbs(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Authentication required' });
                return;
            }

            const limit = Math.min(parseInt(req.query.limit as string) || 6, 20);
            
            const result = await this.florbService.getUserFlorbs(req.user.userId, 1, limit);

            this.handleSuccess(res, { florbs: result.florbs });
        } catch (error) {
            this.handleError(res, error, 'Failed to get user florbs');
        }
    }
}

export default new UserController();
