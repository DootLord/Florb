import { Request, Response } from 'express';
import BaseController from './BaseController.js';

export class HealthController extends BaseController {
    public check = async (req: Request, res: Response): Promise<void> => {
        try {
            const healthData = {
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            };
            this.handleSuccess(res, healthData);
        } catch (error) {
            this.handleError(res, error, 'Health check failed');
        }
    };
}
