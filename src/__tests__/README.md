# Florb API Testing

This directory contains the test suite for the Florb API.

## Test Structure

```
src/__tests__/
├── auth/           # Authentication endpoint tests
├── florb/          # Florb CRUD and generation endpoint tests
├── user/           # User management and dashboard tests
├── worldmap/       # World map and resource management tests
└── setup.ts        # Test setup and mocks
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

## Test Coverage

The test suite covers the following API endpoints:

### Authentication Routes (`/api/auth`)
- ✅ POST `/register` - User registration
- ✅ POST `/login` - User login
- ✅ GET `/verify` - Token verification

### User Routes (`/api/user`)
- ✅ GET `/` - Get all users
- ✅ GET `/:id` - Get user by ID
- ✅ POST `/` - Create user
- ✅ GET `/stats` - Get user statistics (authenticated)
- ✅ GET `/florbs` - Get user's florbs (authenticated)

### Florb Routes (`/api/florbs`)
- ✅ POST `/generate` - Generate a single florb (authenticated)
- ✅ POST `/generate/batch` - Batch generate florbs (authenticated)
- ✅ POST `/` - Create florb
- ✅ GET `/` - Get user's florbs (authenticated)
- ✅ GET `/:id` - Get florb by ID
- ✅ PUT `/:id` - Update florb
- ✅ DELETE `/:id` - Delete florb
- ✅ GET `/florb-id/:florbId` - Get florb by florbId
- ✅ GET `/rarity/:rarity` - Get florbs by rarity
- ✅ GET `/effect/:effect` - Get florbs with specific effect
- ✅ GET `/stats/rarity` - Get rarity statistics
- ✅ GET `/meta/rarities` - Get available rarity levels
- ✅ GET `/meta/effects` - Get available special effects
- ✅ GET `/meta/base-images` - Get base images
- ✅ GET `/meta/rarity-names` - Get rarity name mappings

### World Map Routes (`/api/world-map`)
- ✅ GET `/florbs` - Get placed florbs (authenticated)
- ✅ POST `/florbs` - Place florb on map (authenticated)
- ✅ PUT `/florbs` - Update placed florbs (authenticated)
- ✅ GET `/resources` - Get resource nodes (authenticated)
- ✅ PUT `/resources` - Update resource nodes (authenticated)
- ✅ GET `/player-resources` - Get player resources (authenticated)
- ✅ PUT `/player-resources` - Update player resources (authenticated)
- ✅ POST `/gather` - Record gathering activity (authenticated)
- ✅ POST `/generate-resources` - Generate resource nodes (authenticated)
- ✅ GET `/export-resources` - Export resource data (authenticated)

## Testing Framework

- **Jest**: Testing framework
- **Supertest**: HTTP assertion library for testing Express APIs
- **ts-jest**: TypeScript support for Jest

## Writing New Tests

When adding new endpoints or features, follow the existing test structure:

1. Create a new test file in the appropriate directory (`auth/`, `florb/`, `user/`, or `worldmap/`)
2. Mock the controller methods to return predictable results
3. Mock the AuthMiddleware for authenticated routes
4. Test both success and error cases
5. Test authentication/authorization where applicable

Example test structure:
```typescript
describe('New Feature Routes', () => {
  let app: express.Application;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/feature', featureRoutes);
  });
  
  it('should handle valid request', async () => {
    const response = await request(app)
      .post('/api/feature')
      .send({ data: 'test' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
});
```

## Expanding Test Cases for New Functionality

### Step-by-Step Guide

#### 1. **Identify What Needs Testing**
Before writing tests, determine:
- What new endpoints have been added?
- What new business logic or features exist?
- What edge cases should be covered?
- Are there authentication/authorization requirements?

#### 2. **Choose the Right Test Location**
Organize tests by feature area:
- `auth/` - Authentication and authorization
- `user/` - User management and profiles
- `florb/` - Florb entities and operations
- `worldmap/` - Game world and map features
- Create a new directory if adding a completely new feature area

#### 3. **Create a New Test File**
Name your test file descriptively:
```bash
# For a new endpoint
src/__tests__/florb/florb.trading.test.ts

# For a new feature area
src/__tests__/inventory/inventory.routes.test.ts
```

#### 4. **Set Up Test Structure**

**Basic Template:**
```typescript
import request from 'supertest';
import express from 'express';
import yourRoutes from '../../routes/yourRoutes';

// Mock the controller
jest.mock('../../controllers/YourController', () => {
  return {
    YourController: jest.fn().mockImplementation(() => {
      return {
        yourMethod: jest.fn(async (req, res) => {
          // Mock implementation
          return res.status(200).json({ success: true });
        })
      };
    })
  };
});

// Mock authentication if needed
jest.mock('../../middleware/AuthMiddleware', () => {
  return {
    AuthMiddleware: jest.fn().mockImplementation(() => {
      return {
        authenticate: jest.fn((req, res, next) => {
          const authHeader = req.headers.authorization;
          if (authHeader?.startsWith('Bearer ') && authHeader.substring(7) === 'valid-token') {
            req.user = { userId: 'user-123', username: 'testuser' };
            return next();
          }
          return res.status(401).json({ error: 'Unauthorized' });
        })
      };
    })
  };
});

describe('Your Feature Routes', () => {
  let app: express.Application;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/your-feature', yourRoutes);
  });
  
  describe('POST /api/your-feature/endpoint', () => {
    it('should handle successful request', async () => {
      const response = await request(app)
        .post('/api/your-feature/endpoint')
        .send({ data: 'value' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
    
    it('should handle validation errors', async () => {
      const response = await request(app)
        .post('/api/your-feature/endpoint')
        .send({});
      
      expect(response.status).toBe(400);
    });
    
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/your-feature/endpoint')
        .send({ data: 'value' });
      
      expect(response.status).toBe(401);
    });
  });
});
```

#### 5. **Test Coverage Best Practices**

For each endpoint, test:

**Happy Path:**
```typescript
it('should successfully create a resource', async () => {
  const response = await request(app)
    .post('/api/resource')
    .set('Authorization', 'Bearer valid-token')
    .send({ name: 'Test Resource', value: 100 });
  
  expect(response.status).toBe(201);
  expect(response.body.data).toHaveProperty('name', 'Test Resource');
});
```

**Validation Errors:**
```typescript
it('should return 400 for missing required fields', async () => {
  const response = await request(app)
    .post('/api/resource')
    .set('Authorization', 'Bearer valid-token')
    .send({ name: 'Test' }); // missing 'value'
  
  expect(response.status).toBe(400);
  expect(response.body).toHaveProperty('error');
});
```

**Authentication/Authorization:**
```typescript
it('should return 401 without valid token', async () => {
  const response = await request(app)
    .post('/api/resource')
    .send({ name: 'Test', value: 100 });
  
  expect(response.status).toBe(401);
});

it('should return 403 for insufficient permissions', async () => {
  const response = await request(app)
    .delete('/api/resource/admin-only')
    .set('Authorization', 'Bearer valid-token');
  
  expect(response.status).toBe(403);
});
```

**Edge Cases:**
```typescript
it('should handle resource not found', async () => {
  const response = await request(app)
    .get('/api/resource/non-existent-id');
  
  expect(response.status).toBe(404);
});

it('should handle duplicate entries', async () => {
  const response = await request(app)
    .post('/api/resource')
    .send({ name: 'Existing Resource' });
  
  expect(response.status).toBe(409);
});
```

#### 6. **Mocking Complex Scenarios**

**Conditional Mock Responses:**
```typescript
jest.mock('../../controllers/YourController', () => {
  return {
    YourController: jest.fn().mockImplementation(() => {
      return {
        createResource: jest.fn(async (req, res) => {
          const { name, value } = req.body;
          
          // Validation
          if (!name || !value) {
            return res.status(400).json({ error: 'Missing fields' });
          }
          
          // Duplicate check
          if (name === 'Duplicate') {
            return res.status(409).json({ error: 'Already exists' });
          }
          
          // Success case
          return res.status(201).json({
            success: true,
            data: { id: 'new-id', name, value }
          });
        })
      };
    })
  };
});
```

**Testing with Query Parameters:**
```typescript
it('should filter results by query params', async () => {
  const response = await request(app)
    .get('/api/resources')
    .query({ category: 'weapons', minValue: 50 });
  
  expect(response.status).toBe(200);
  expect(response.body.data).toBeInstanceOf(Array);
});
```

**Testing File Uploads (if needed):**
```typescript
it('should handle file upload', async () => {
  const response = await request(app)
    .post('/api/upload')
    .attach('file', 'path/to/test-file.png')
    .set('Authorization', 'Bearer valid-token');
  
  expect(response.status).toBe(200);
});
```

#### 7. **Running Your New Tests**

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/__tests__/your-feature/your-test.test.ts

# Run tests in watch mode while developing
npm run test:watch

# Check coverage
npm run test:coverage
```

#### 8. **Common Patterns in This Codebase**

**Pattern 1: Testing Authenticated Endpoints**
```typescript
const response = await request(app)
  .post('/api/endpoint')
  .set('Authorization', 'Bearer valid-token')  // Add auth header
  .send({ data: 'value' });
```

**Pattern 2: Testing Different User Roles (if implemented)**
```typescript
// In your mock
authenticate: jest.fn((req, res, next) => {
  const token = req.headers.authorization?.substring(7);
  if (token === 'admin-token') {
    req.user = { userId: 'admin-1', role: 'admin' };
  } else if (token === 'valid-token') {
    req.user = { userId: 'user-123', role: 'user' };
  }
  next();
})
```

**Pattern 3: Testing Pagination**
```typescript
it('should support pagination', async () => {
  const response = await request(app)
    .get('/api/resources')
    .query({ page: 2, limit: 10 });
  
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('page', 2);
  expect(response.body.data.length).toBeLessThanOrEqual(10);
});
```

#### 9. **Tips for Maintaining Tests**

- **Keep tests independent**: Each test should work in isolation
- **Use descriptive names**: Test names should explain what they verify
- **Don't test implementation details**: Focus on behavior and outcomes
- **Update tests when APIs change**: Keep tests in sync with code
- **Use `beforeEach` for setup**: Reset state before each test
- **Group related tests**: Use nested `describe` blocks
- **Mock external dependencies**: Avoid real database or API calls

#### 10. **Example: Adding Tests for a New Trading Feature**

```typescript
// src/__tests__/trading/trading.routes.test.ts
import request from 'supertest';
import express from 'express';
import tradingRoutes from '../../routes/tradingRoutes';

jest.mock('../../controllers/TradingController', () => {
  return {
    TradingController: jest.fn().mockImplementation(() => {
      return {
        createTrade: jest.fn(async (req, res) => {
          if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
          }
          
          const { offerFlorbId, requestFlorbId, targetUserId } = req.body;
          
          if (!offerFlorbId || !requestFlorbId || !targetUserId) {
            return res.status(400).json({ error: 'Missing required fields' });
          }
          
          return res.status(201).json({
            success: true,
            data: {
              id: 'trade-123',
              fromUserId: req.user.userId,
              toUserId: targetUserId,
              offerFlorbId,
              requestFlorbId,
              status: 'pending'
            }
          });
        }),
        
        acceptTrade: jest.fn(async (req, res) => {
          const { id } = req.params;
          
          if (id === 'trade-123') {
            return res.status(200).json({
              success: true,
              data: { id, status: 'completed' }
            });
          }
          
          return res.status(404).json({ error: 'Trade not found' });
        })
      };
    })
  };
});

jest.mock('../../middleware/AuthMiddleware', () => {
  return {
    AuthMiddleware: jest.fn().mockImplementation(() => {
      return {
        authenticate: jest.fn((req, res, next) => {
          const token = req.headers.authorization?.substring(7);
          if (token === 'valid-token') {
            req.user = { userId: 'user-123' };
            return next();
          }
          return res.status(401).json({ error: 'Unauthorized' });
        })
      };
    })
  };
});

describe('Trading Routes', () => {
  let app: express.Application;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/trading', tradingRoutes);
  });
  
  describe('POST /api/trading/create', () => {
    it('should create a trade offer', async () => {
      const response = await request(app)
        .post('/api/trading/create')
        .set('Authorization', 'Bearer valid-token')
        .send({
          offerFlorbId: 'florb-1',
          requestFlorbId: 'florb-2',
          targetUserId: 'user-456'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('status', 'pending');
    });
    
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/trading/create')
        .send({
          offerFlorbId: 'florb-1',
          requestFlorbId: 'florb-2',
          targetUserId: 'user-456'
        });
      
      expect(response.status).toBe(401);
    });
    
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/trading/create')
        .set('Authorization', 'Bearer valid-token')
        .send({ offerFlorbId: 'florb-1' });
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('POST /api/trading/:id/accept', () => {
    it('should accept a trade', async () => {
      const response = await request(app)
        .post('/api/trading/trade-123/accept')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('completed');
    });
    
    it('should return 404 for non-existent trade', async () => {
      const response = await request(app)
        .post('/api/trading/non-existent/accept')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(404);
    });
  });
});
```

This example demonstrates all the key principles: mocking, authentication testing, validation testing, and error handling.

## Notes

- Tests use mocked controllers to avoid database dependencies
- Authentication tests use mock JWT tokens
- All tests run in isolation with fresh mocks for each test
- Coverage reports are generated in the `coverage/` directory (gitignored)
