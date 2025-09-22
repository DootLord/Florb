import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService.js';
import { RegisterDto, LoginDto } from '../types/User.js';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    // Register a new user
    register = async (req: Request, res: Response): Promise<void> => {
        try {
            const userData: RegisterDto = req.body;

            const result = await this.authService.register(userData);

            res.status(201).json(result);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Registration failed';
            res.status(400).json({ message });
        }
    };

    // Login user
    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const credentials: LoginDto = req.body;

            const result = await this.authService.login(credentials);

            res.status(200).json(result);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed';
            res.status(401).json({ message });
        }
    };

    // Verify JWT token
    verify = async (req: Request, res: Response): Promise<void> => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({ valid: false, message: 'No token provided' });
                return;
            }

            const token = authHeader.substring(7);
            const result = await this.authService.verifyToken(token);

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ valid: false, message: 'Verification error' });
        }
    };
}