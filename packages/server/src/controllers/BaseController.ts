import type { Response } from 'express';

abstract class BaseController {
    protected handleError(res: Response, error: unknown, message = 'An error occurred'): void {
        console.error(message, error);
        res.status(500).json({ 
            error: message,
            ...(process.env.NODE_ENV === 'development' && { details: error })
        });
    }

    protected handleNotFound(res: Response, message = 'Resource not found'): void {
        res.status(404).json({ error: message });
    }

    protected handleSuccess(res: Response, data: any, message?: string): void {
        const response = message ? { message, data } : data;
        res.json(response);
    }
}

export default BaseController;
