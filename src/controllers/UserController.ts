import type { Request, Response } from 'express';
import UserService from '../services/UserService.js';
import BaseController from './BaseController.js';

class UserController extends BaseController {
    private userService: UserService;

    constructor() {
        super();
        this.userService = new UserService();
        
        // Bind methods to preserve 'this' context
        this.getAllUsers = this.getAllUsers.bind(this);
        this.getUserById = this.getUserById.bind(this);
        this.createUser = this.createUser.bind(this);
    }

    async getAllUsers(req: Request, res: Response): Promise<void> {
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
}

export default new UserController();
