import { PrismaClient } from "../generated/prisma/client";

// Create a single PrismaClient instance (safe for hot-reload / dev)
const globalForPrisma = global as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
