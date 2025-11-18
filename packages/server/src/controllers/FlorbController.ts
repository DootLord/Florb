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
      if (!req.user) {
        this.sendError(res, 'Authentication required', 401);
        return;
      }

      // Handle empty request body by providing empty object
      const requestData = req.body || {};
      const validatedData = GenerateFlorbSchema.parse(requestData);
      const florb = await this.florbService.generateFlorb(validatedData, req.user.userId);

      res.status(201).json({ data: florb });
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
      if (!req.user) {
        this.sendError(res, 'Authentication required', 401);
        return;
      }

      const validatedData = CreateFlorbSchema.parse(req.body);
      const florb = await this.florbService.createFlorb(validatedData, req.user.userId);
      
      res.status(201).json(florb);
    } catch (error) {
      this.handleError(res, error, 'Failed to create florb');
    }
  };

  // Get authenticated user's florbs
  getUserFlorbs = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        this.sendError(res, 'Authentication required', 401);
        return;
      }

      return this.florbService.getFlorbsByCollectionId(req.user.userId).then(result => {
        res.json({ florbs: result });
      });

      // const page = parseInt(req.query.page as string) || 1;
      // const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

      // const result = await this.florbService.getUserFlorbs(req.user.userId, page, limit);
      // res.json({ florbs: result.florbs });
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve user florbs');
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
      
      res.json(florb);
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
      
      res.json(florb);
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
      
      res.json(florb);
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
      
      res.json({ id });
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
      res.json(florbs);
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
      res.json(florbs);
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve florbs by effect');
    }
  };

  // Get rarity statistics
  getRarityStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.florbService.getRarityStats();
      res.json(stats);
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve rarity statistics');
    }
  };

  // Get available rarity levels
  getRarityLevels = async (_req: Request, res: Response): Promise<void> => {
    try {
      res.json(RARITY_LEVELS);
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve rarity levels');
    }
  };

  // Get available special effects
  getSpecialEffects = async (_req: Request, res: Response): Promise<void> => {
    try {
      res.json(SPECIAL_EFFECTS);
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve special effects');
    }
  };

  // Get available base images
  getBaseImages = async (_req: Request, res: Response): Promise<void> => {
    try {
      const baseImages = await this.florbService.getBaseImagesList();
      res.json(baseImages);
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve base images');
    }
  };

  // Get rarity name mappings
  getRarityNameMappings = async (_req: Request, res: Response): Promise<void> => {
    try {
      const mappings = await this.florbService.getRarityNameMappings();
      res.json(mappings);
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve rarity name mappings');
    }
  };
}
