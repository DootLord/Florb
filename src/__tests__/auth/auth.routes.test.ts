import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/authRoutes';

// Mock the AuthController
jest.mock('../../controllers/AuthController', () => {
  return {
    AuthController: jest.fn().mockImplementation(() => {
      return {
        register: jest.fn(async (req, res) => {
          const { username, email, password } = req.body;
          
          // Simulate validation
          if (!username || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
          }
          
          // Simulate duplicate user
          if (email === 'existing@example.com') {
            return res.status(400).json({ message: 'User already exists' });
          }
          
          return res.status(201).json({
            message: 'User registered successfully',
            user: { id: 'user-123', username, email },
            token: 'mock-jwt-token'
          });
        }),
        
        login: jest.fn(async (req, res) => {
          const { email, password } = req.body;
          
          // Simulate validation
          if (!email || !password) {
            return res.status(401).json({ message: 'Invalid credentials' });
          }
          
          // Simulate successful login
          if (email === 'test@example.com' && password === 'password123') {
            return res.status(200).json({
              message: 'Login successful',
              user: { id: 'user-123', username: 'testuser', email },
              token: 'mock-jwt-token'
            });
          }
          
          return res.status(401).json({ message: 'Invalid credentials' });
        }),
        
        verify: jest.fn(async (req, res) => {
          const authHeader = req.headers.authorization;
          
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ valid: false, message: 'No token provided' });
          }
          
          const token = authHeader.substring(7);
          
          // Simulate token verification
          if (token === 'valid-token') {
            return res.status(200).json({
              valid: true,
              user: { id: 'user-123', username: 'testuser', email: 'test@example.com' }
            });
          }
          
          return res.status(401).json({ valid: false, message: 'Invalid token' });
        })
      };
    })
  };
});

describe('Auth Routes', () => {
  let app: express.Application;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'new@example.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('username', 'newuser');
      expect(response.body.user).toHaveProperty('email', 'new@example.com');
    });
    
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser'
          // Missing email and password
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Missing required fields');
    });
    
    it('should return 400 if user already exists', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existinguser',
          email: 'existing@example.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'User already exists');
    });
  });
  
  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });
    
    it('should return 401 with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
    
    it('should return 401 if email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123'
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });
  
  describe('GET /api/auth/verify', () => {
    it('should verify a valid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('valid', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });
    
    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('valid', false);
      expect(response.body).toHaveProperty('message', 'Invalid token');
    });
    
    it('should return 401 if no token is provided', async () => {
      const response = await request(app)
        .get('/api/auth/verify');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('valid', false);
      expect(response.body).toHaveProperty('message', 'No token provided');
    });
    
    it('should return 401 if Authorization header is malformed', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'InvalidFormat token');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('valid', false);
      expect(response.body).toHaveProperty('message', 'No token provided');
    });
  });
});
