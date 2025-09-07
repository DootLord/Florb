import type { Request, Response } from 'express';
import { FlorbService } from '../services/FlorbService.js';
import { 
  CreateFlorbSchema, 
  UpdateFlorbSchema, 
  GenerateFlorbSchema,
  BatchGenerateFlorbSchema,
  RARITY_LEVELS,
  SPECIAL_EFFECTS
} from '../types/Florb.js';
import type { RarityLevel, SpecialEffect } from '../types/Florb.js';
import BaseController from './BaseController.js';

export class FlorbController extends BaseController {
  private florbService: FlorbService;

  constructor() {
    super();
    this.florbService = new FlorbService();
  }

  // Send success response with optional status code
  private sendSuccess(res: Response, data: any, message?: string, statusCode = 200): void {
    res.status(statusCode).json({
      success: true,
      message: message || 'Success',
      data
    });
  }

  // Send error response
  private sendError(res: Response, message: string, statusCode = 500): void {
    res.status(statusCode).json({
      success: false,
      error: message
    });
  }

  // Generate a single florb
  generateFlorb = async (req: Request, res: Response): Promise<void> => {
    try {
      // Handle empty request body by providing empty object
      const requestData = req.body || {};
      const validatedData = GenerateFlorbSchema.parse(requestData);
      const florb = await this.florbService.generateFlorb(validatedData);
      
      this.sendSuccess(res, florb, 'Florb generated successfully', 201);
    } catch (error) {
      this.handleError(res, error, 'Failed to generate florb');
    }
  };

  // Generate multiple florbs
  batchGenerateFlorbs = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = BatchGenerateFlorbSchema.parse(req.body);
      const florbs = await this.florbService.batchGenerateFlorbs(validatedData);
      
      this.sendSuccess(res, {
        florbs,
        count: florbs.length,
        generated: new Date().toISOString()
      }, 'Florbs generated successfully', 201);
    } catch (error) {
      this.handleError(res, error, 'Failed to generate florbs');
    }
  };

  // Create a custom florb
  createFlorb = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = CreateFlorbSchema.parse(req.body);
      const florb = await this.florbService.createFlorb(validatedData);
      
      this.sendSuccess(res, florb, 'Florb created successfully', 201);
    } catch (error) {
      this.handleError(res, error, 'Failed to create florb');
    }
  };

  // Get all florbs with pagination and filtering
  getAllFlorbs = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const rarity = req.query.rarity as RarityLevel | undefined;
      
      // Validate rarity if provided
      if (rarity && !RARITY_LEVELS.includes(rarity)) {
        this.sendError(res, 'Invalid rarity level', 400);
        return;
      }
      
      const result = await this.florbService.getAllFlorbs(page, limit, rarity);
      this.sendSuccess(res, result, 'Florbs retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve florbs');
    }
  };

  // Get florb by ID
  getFlorbById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        this.sendError(res, 'Florb ID is required', 400);
        return;
      }
      
      const florb = await this.florbService.getFlorbById(id);
      
      if (!florb) {
        this.sendError(res, 'Florb not found', 404);
        return;
      }
      
      this.sendSuccess(res, florb, 'Florb retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve florb');
    }
  };

  // Get florb by florb ID
  getFlorbByFlorbId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { florbId } = req.params;
      
      if (!florbId) {
        this.sendError(res, 'Florb ID is required', 400);
        return;
      }
      
      const florb = await this.florbService.getFlorbByFlorbId(florbId);
      
      if (!florb) {
        this.sendError(res, 'Florb not found', 404);
        return;
      }
      
      this.sendSuccess(res, florb, 'Florb retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve florb');
    }
  };

  // Update florb
  updateFlorb = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        this.sendError(res, 'Florb ID is required', 400);
        return;
      }
      
      const validatedData = UpdateFlorbSchema.parse(req.body);
      
      const florb = await this.florbService.updateFlorb(id, validatedData);
      
      if (!florb) {
        this.sendError(res, 'Florb not found', 404);
        return;
      }
      
      this.sendSuccess(res, florb, 'Florb updated successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to update florb');
    }
  };

  // Delete florb
  deleteFlorb = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        this.sendError(res, 'Florb ID is required', 400);
        return;
      }
      
      const deleted = await this.florbService.deleteFlorb(id);
      
      if (!deleted) {
        this.sendError(res, 'Florb not found', 404);
        return;
      }
      
      this.sendSuccess(res, { id }, 'Florb deleted successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to delete florb');
    }
  };

  // Get florbs by rarity
  getFlorbsByRarity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { rarity } = req.params;
      
      // Validate rarity
      if (!RARITY_LEVELS.includes(rarity as RarityLevel)) {
        this.sendError(res, 'Invalid rarity level', 400);
        return;
      }
      
      const florbs = await this.florbService.getFlorbsByRarity(rarity as RarityLevel);
      this.sendSuccess(res, florbs, `${rarity} florbs retrieved successfully`);
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve florbs by rarity');
    }
  };

  // Get florbs with specific effect
  getFlorbsWithEffect = async (req: Request, res: Response): Promise<void> => {
    try {
      const { effect } = req.params;
      
      // Validate effect
      if (!SPECIAL_EFFECTS.includes(effect as SpecialEffect)) {
        this.sendError(res, 'Invalid special effect', 400);
        return;
      }
      
      const florbs = await this.florbService.getFlorbsWithEffect(effect as SpecialEffect);
      this.sendSuccess(res, florbs, `Florbs with ${effect} effect retrieved successfully`);
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve florbs by effect');
    }
  };

  // Get rarity statistics
  getRarityStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.florbService.getRarityStats();
      this.sendSuccess(res, stats, 'Rarity statistics retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve rarity statistics');
    }
  };

  // Get available rarity levels
  getRarityLevels = async (_req: Request, res: Response): Promise<void> => {
    try {
      this.sendSuccess(res, RARITY_LEVELS, 'Rarity levels retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve rarity levels');
    }
  };

  // Get available special effects
  getSpecialEffects = async (_req: Request, res: Response): Promise<void> => {
    try {
      this.sendSuccess(res, SPECIAL_EFFECTS, 'Special effects retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve special effects');
    }
  };

  // Get available base images
  getBaseImages = async (_req: Request, res: Response): Promise<void> => {
    try {
      const baseImages = await this.florbService.getBaseImagesList();
      this.sendSuccess(res, baseImages, 'Base images retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve base images');
    }
  };
}
