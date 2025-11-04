import request from 'supertest';
import express from 'express';
import florbRoutes from '../../routes/florbRoutes';

// Mock the FlorbController
jest.mock('../../controllers/FlorbController', () => {
  return {
    FlorbController: jest.fn().mockImplementation(() => {
      return {
        generateFlorb: jest.fn(async (req, res) => {
          if (!req.user) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
          }
          
          return res.status(201).json({
            success: true,
            message: 'Florb generated successfully',
            data: {
              id: 'florb-generated-1',
              florbId: 12345,
              rarity: 'rare',
              specialEffect: 'glow'
            }
          });
        }),
        
        batchGenerateFlorbs: jest.fn(async (req, res) => {
          if (!req.user) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
          }
          
          const { count = 5 } = req.body;
          
          return res.status(201).json({
            success: true,
            message: `Generated ${count} florbs`,
            data: Array.from({ length: count }, (_, i) => ({
              id: `florb-batch-${i}`,
              florbId: 10000 + i,
              rarity: 'common'
            }))
          });
        }),
        
        createFlorb: jest.fn(async (req, res) => {
          const { florbId, rarity } = req.body;
          
          if (!florbId || !rarity) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
          }
          
          return res.status(201).json({
            success: true,
            data: { id: 'florb-new', florbId, rarity }
          });
        }),
        
        getUserFlorbs: jest.fn(async (req, res) => {
          if (!req.user) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
          }
          
          return res.status(200).json({
            success: true,
            data: [
              { id: 'florb-1', florbId: 1001, rarity: 'common' },
              { id: 'florb-2', florbId: 1002, rarity: 'rare' }
            ]
          });
        }),
        
        getFlorbById: jest.fn(async (req, res) => {
          const { id } = req.params;
          
          if (id === 'florb-1') {
            return res.status(200).json({
              success: true,
              data: { id: 'florb-1', florbId: 1001, rarity: 'common' }
            });
          }
          
          return res.status(404).json({ success: false, error: 'Florb not found' });
        }),
        
        updateFlorb: jest.fn(async (req, res) => {
          const { id } = req.params;
          
          if (id === 'florb-1') {
            return res.status(200).json({
              success: true,
              data: { id: 'florb-1', ...req.body }
            });
          }
          
          return res.status(404).json({ success: false, error: 'Florb not found' });
        }),
        
        deleteFlorb: jest.fn(async (req, res) => {
          const { id } = req.params;
          
          if (id === 'florb-1') {
            return res.status(200).json({
              success: true,
              message: 'Florb deleted successfully'
            });
          }
          
          return res.status(404).json({ success: false, error: 'Florb not found' });
        }),
        
        getFlorbByFlorbId: jest.fn(async (req, res) => {
          const { florbId } = req.params;
          
          if (florbId === '1001') {
            return res.status(200).json({
              success: true,
              data: { id: 'florb-1', florbId: 1001, rarity: 'common' }
            });
          }
          
          return res.status(404).json({ success: false, error: 'Florb not found' });
        }),
        
        getFlorbsByRarity: jest.fn(async (req, res) => {
          const { rarity } = req.params;
          
          return res.status(200).json({
            success: true,
            data: [
              { id: 'florb-1', florbId: 1001, rarity },
              { id: 'florb-2', florbId: 1002, rarity }
            ]
          });
        }),
        
        getFlorbsWithEffect: jest.fn(async (req, res) => {
          const { effect } = req.params;
          
          return res.status(200).json({
            success: true,
            data: [
              { id: 'florb-1', florbId: 1001, specialEffect: effect }
            ]
          });
        }),
        
        getRarityStats: jest.fn(async (_req, res) => {
          return res.status(200).json({
            success: true,
            data: {
              common: 100,
              rare: 50,
              epic: 10
            }
          });
        }),
        
        getRarityLevels: jest.fn(async (_req, res) => {
          return res.status(200).json({
            success: true,
            data: ['common', 'uncommon', 'rare', 'epic', 'legendary']
          });
        }),
        
        getSpecialEffects: jest.fn(async (_req, res) => {
          return res.status(200).json({
            success: true,
            data: ['glow', 'sparkle', 'shadow']
          });
        }),
        
        getBaseImages: jest.fn(async (_req, res) => {
          return res.status(200).json({
            success: true,
            data: ['image1.png', 'image2.png']
          });
        }),
        
        getRarityNameMappings: jest.fn(async (_req, res) => {
          return res.status(200).json({
            success: true,
            data: {
              0: 'common',
              1: 'uncommon',
              2: 'rare'
            }
          });
        })
      };
    })
  };
});

// Mock the AuthMiddleware
jest.mock('../../middleware/AuthMiddleware', () => {
  return {
    AuthMiddleware: jest.fn().mockImplementation(() => {
      return {
        authenticate: jest.fn((req, res, next) => {
          const authHeader = req.headers.authorization;
          
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required' });
          }
          
          const token = authHeader.substring(7);
          
          if (token === 'valid-token') {
            req.user = { userId: 'user-123', username: 'testuser', email: 'test@example.com' };
            return next();
          }
          
          return res.status(401).json({ error: 'Invalid token' });
        })
      };
    })
  };
});

describe('Florb Routes', () => {
  let app: express.Application;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/florbs', florbRoutes);
  });
  
  describe('POST /api/florbs/generate (authenticated)', () => {
    it('should generate a florb with valid token', async () => {
      const response = await request(app)
        .post('/api/florbs/generate')
        .set('Authorization', 'Bearer valid-token')
        .send({});
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('florbId');
      expect(response.body.data).toHaveProperty('rarity');
    });
    
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/florbs/generate')
        .send({});
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('POST /api/florbs/generate/batch (authenticated)', () => {
    it('should batch generate florbs with valid token', async () => {
      const response = await request(app)
        .post('/api/florbs/generate/batch')
        .set('Authorization', 'Bearer valid-token')
        .send({ count: 3 });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(3);
    });
  });
  
  describe('POST /api/florbs', () => {
    it('should create a florb', async () => {
      const response = await request(app)
        .post('/api/florbs')
        .send({
          florbId: 12345,
          rarity: 'rare'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('florbId', 12345);
    });
    
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/florbs')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('GET /api/florbs (authenticated)', () => {
    it('should get user florbs with valid token', async () => {
      const response = await request(app)
        .get('/api/florbs')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(2);
    });
  });
  
  describe('GET /api/florbs/:id', () => {
    it('should get a florb by ID', async () => {
      const response = await request(app)
        .get('/api/florbs/florb-1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', 'florb-1');
    });
    
    it('should return 404 for non-existent florb', async () => {
      const response = await request(app)
        .get('/api/florbs/non-existent');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('PUT /api/florbs/:id', () => {
    it('should update a florb', async () => {
      const response = await request(app)
        .put('/api/florbs/florb-1')
        .send({ rarity: 'epic' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('rarity', 'epic');
    });
  });
  
  describe('DELETE /api/florbs/:id', () => {
    it('should delete a florb', async () => {
      const response = await request(app)
        .delete('/api/florbs/florb-1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });
  
  describe('GET /api/florbs/florb-id/:florbId', () => {
    it('should get a florb by florbId', async () => {
      const response = await request(app)
        .get('/api/florbs/florb-id/1001');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('florbId', 1001);
    });
  });
  
  describe('GET /api/florbs/rarity/:rarity', () => {
    it('should get florbs by rarity', async () => {
      const response = await request(app)
        .get('/api/florbs/rarity/rare');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(2);
    });
  });
  
  describe('GET /api/florbs/effect/:effect', () => {
    it('should get florbs by special effect', async () => {
      const response = await request(app)
        .get('/api/florbs/effect/glow');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });
  
  describe('GET /api/florbs/stats/rarity', () => {
    it('should get rarity statistics', async () => {
      const response = await request(app)
        .get('/api/florbs/stats/rarity');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('common');
    });
  });
  
  describe('GET /api/florbs/meta/rarities', () => {
    it('should get rarity levels', async () => {
      const response = await request(app)
        .get('/api/florbs/meta/rarities');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
  
  describe('GET /api/florbs/meta/effects', () => {
    it('should get special effects', async () => {
      const response = await request(app)
        .get('/api/florbs/meta/effects');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
  
  describe('GET /api/florbs/meta/base-images', () => {
    it('should get base images', async () => {
      const response = await request(app)
        .get('/api/florbs/meta/base-images');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
  
  describe('GET /api/florbs/meta/rarity-names', () => {
    it('should get rarity name mappings', async () => {
      const response = await request(app)
        .get('/api/florbs/meta/rarity-names');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('0', 'common');
    });
  });
});
