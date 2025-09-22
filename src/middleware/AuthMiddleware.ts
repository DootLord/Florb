import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService.js';

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                username: string;
            };
        }
    }
}

export class AuthMiddleware {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    // Middleware to verify JWT token
    authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({ message: 'Authentication required' });
                return;
            }

            const token = authHeader.substring(7); // Remove 'Bearer ' prefix

            const verification = await this.authService.verifyToken(token);

            if (!verification.valid) {
                res.status(401).json({
                    message: verification.message || 'Invalid or expired token'
                });
                return;
            }

            // Attach user info to request
            req.user = {
                userId: token, // We'll decode this properly in the service
                username: verification.username!
            };

            next();
        } catch (error) {
            res.status(500).json({ message: 'Authentication error' });
        }
    };

    // Optional authentication (doesn't fail if no token)
    optionalAuthenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.headers.authorization;

            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                const verification = await this.authService.verifyToken(token);

                if (verification.valid) {
                    req.user = {
                        userId: token,
                        username: verification.username!
                    };
                }
            }

            next();
        } catch (error) {
            // Don't fail, just continue without authentication
            next();
        }
    };
}