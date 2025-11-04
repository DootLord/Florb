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

## Notes

- Tests use mocked controllers to avoid database dependencies
- Authentication tests use mock JWT tokens
- All tests run in isolation with fresh mocks for each test
- Coverage reports are generated in the `coverage/` directory (gitignored)
