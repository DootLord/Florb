import request from 'supertest';
import express from 'express';
import worldMapRoutes from '../../routes/worldMapRoutes';

// Mock the WorldMapController
jest.mock('../../controllers/WorldMapController', () => {
  return {
    WorldMapController: jest.fn().mockImplementation(() => {
      return {
        getPlacedFlorbs: jest.fn(async (req, res) => {
          if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
          }
          
          return res.status(200).json({
            success: true,
            data: [
              { id: 'placed-1', florbId: 'florb-1', x: 100, y: 200 },
              { id: 'placed-2', florbId: 'florb-2', x: 300, y: 400 }
            ]
          });
        }),
        
        placeFlorb: jest.fn(async (req, res) => {
          if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
          }
          
          const { florbId, x, y } = req.body;
          
          if (!florbId || x === undefined || y === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
          }
          
          return res.status(201).json({
            success: true,
            data: { id: 'placed-new', florbId, x, y }
          });
        }),
        
        updatePlacedFlorbs: jest.fn(async (req, res) => {
          if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
          }
          
          return res.status(200).json({
            success: true,
            message: 'Placed florbs updated successfully'
          });
        }),
        
        getResourceNodes: jest.fn(async (req, res) => {
          if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
          }
          
          return res.status(200).json({
            success: true,
            data: [
              { id: 'resource-1', type: 'wood', x: 150, y: 250, amount: 100 },
              { id: 'resource-2', type: 'stone', x: 350, y: 450, amount: 75 }
            ]
          });
        }),
        
        updateResourceNodes: jest.fn(async (req, res) => {
          if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
          }
          
          return res.status(200).json({
            success: true,
            message: 'Resource nodes updated successfully'
          });
        }),
        
        getPlayerResources: jest.fn(async (req, res) => {
          if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
          }
          
          return res.status(200).json({
            success: true,
            data: {
              wood: 500,
              stone: 300,
              gold: 150
            }
          });
        }),
        
        updatePlayerResources: jest.fn(async (req, res) => {
          if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
          }
          
          return res.status(200).json({
            success: true,
            message: 'Player resources updated successfully',
            data: req.body
          });
        }),
        
        recordGathering: jest.fn(async (req, res) => {
          if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
          }
          
          const { resourceType, amount } = req.body;
          
          if (!resourceType || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
          }
          
          return res.status(201).json({
            success: true,
            message: 'Gathering recorded successfully',
            data: { resourceType, amount, timestamp: Date.now() }
          });
        }),
        
        generateResourceNodes: jest.fn(async (req, res) => {
          if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
          }
          
          const { count = 10 } = req.body;
          
          return res.status(201).json({
            success: true,
            message: `Generated ${count} resource nodes`,
            data: Array.from({ length: count }, (_, i) => ({
              id: `resource-${i}`,
              type: 'wood',
              x: i * 50,
              y: i * 50,
              amount: 100
            }))
          });
        }),
        
        exportResourceData: jest.fn(async (req, res) => {
          if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
          }
          
          return res.status(200).json({
            success: true,
            data: {
              exportedAt: Date.now(),
              resources: [
                { type: 'wood', total: 500 },
                { type: 'stone', total: 300 }
              ]
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

describe('World Map Routes', () => {
  let app: express.Application;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/world-map', worldMapRoutes);
  });
  
  describe('GET /api/world-map/florbs (authenticated)', () => {
    it('should get placed florbs with valid token', async () => {
      const response = await request(app)
        .get('/api/world-map/florbs')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('x');
      expect(response.body.data[0]).toHaveProperty('y');
    });
    
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/world-map/florbs');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('POST /api/world-map/florbs (authenticated)', () => {
    it('should place a florb on the map', async () => {
      const response = await request(app)
        .post('/api/world-map/florbs')
        .set('Authorization', 'Bearer valid-token')
        .send({
          florbId: 'florb-123',
          x: 500,
          y: 600
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('florbId', 'florb-123');
      expect(response.body.data).toHaveProperty('x', 500);
      expect(response.body.data).toHaveProperty('y', 600);
    });
    
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/world-map/florbs')
        .set('Authorization', 'Bearer valid-token')
        .send({
          florbId: 'florb-123'
          // Missing x and y
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('PUT /api/world-map/florbs (authenticated)', () => {
    it('should update placed florbs', async () => {
      const response = await request(app)
        .put('/api/world-map/florbs')
        .set('Authorization', 'Bearer valid-token')
        .send({
          florbs: [
            { id: 'placed-1', x: 200, y: 300 }
          ]
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });
  
  describe('GET /api/world-map/resources (authenticated)', () => {
    it('should get resource nodes', async () => {
      const response = await request(app)
        .get('/api/world-map/resources')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('type');
      expect(response.body.data[0]).toHaveProperty('amount');
    });
  });
  
  describe('PUT /api/world-map/resources (authenticated)', () => {
    it('should update resource nodes', async () => {
      const response = await request(app)
        .put('/api/world-map/resources')
        .set('Authorization', 'Bearer valid-token')
        .send({
          resources: [
            { id: 'resource-1', amount: 50 }
          ]
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });
  
  describe('GET /api/world-map/player-resources (authenticated)', () => {
    it('should get player resources', async () => {
      const response = await request(app)
        .get('/api/world-map/player-resources')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('wood');
      expect(response.body.data).toHaveProperty('stone');
      expect(response.body.data).toHaveProperty('gold');
    });
  });
  
  describe('PUT /api/world-map/player-resources (authenticated)', () => {
    it('should update player resources', async () => {
      const response = await request(app)
        .put('/api/world-map/player-resources')
        .set('Authorization', 'Bearer valid-token')
        .send({
          wood: 600,
          stone: 400
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('wood', 600);
    });
  });
  
  describe('POST /api/world-map/gather (authenticated)', () => {
    it('should record gathering activity', async () => {
      const response = await request(app)
        .post('/api/world-map/gather')
        .set('Authorization', 'Bearer valid-token')
        .send({
          resourceType: 'wood',
          amount: 50
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('resourceType', 'wood');
      expect(response.body.data).toHaveProperty('amount', 50);
    });
    
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/world-map/gather')
        .set('Authorization', 'Bearer valid-token')
        .send({
          resourceType: 'wood'
          // Missing amount
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('POST /api/world-map/generate-resources (authenticated)', () => {
    it('should generate resource nodes', async () => {
      const response = await request(app)
        .post('/api/world-map/generate-resources')
        .set('Authorization', 'Bearer valid-token')
        .send({
          count: 5
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(5);
    });
  });
  
  describe('GET /api/world-map/export-resources (authenticated)', () => {
    it('should export resource data', async () => {
      const response = await request(app)
        .get('/api/world-map/export-resources')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('exportedAt');
      expect(response.body.data).toHaveProperty('resources');
    });
  });
});
