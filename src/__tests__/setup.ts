// Mock Prisma Client
export const mockPrismaClient = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  florb: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  worldMap: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  placedFlorb: {
    create: jest.fn(),
    findMany: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  resourceNode: {
    create: jest.fn(),
    findMany: jest.fn(),
    updateMany: jest.fn(),
  },
  playerResources: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  $disconnect: jest.fn(),
};

// Mock the Prisma module
jest.mock('../db/prisma', () => ({
  prisma: mockPrismaClient,
}));

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
