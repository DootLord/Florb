import { RegisterSchema } from '../types/User.js';
import { prisma } from '../db/prisma.js';
import crypto from 'crypto';

class UserService {
    async getAllUsers(): Promise<any[]> {
        return prisma.users.findMany();
    }

    async getUserById(id: string): Promise<any | null> {
        return prisma.users.findUnique({ where: { id } });
    }

    async createUser(userData: any): Promise<any> {
        // Validate input with Zod
        const validatedData = RegisterSchema.parse(userData);

        const id = (crypto as any).randomUUID ? (crypto as any).randomUUID() : crypto.randomBytes(16).toString('hex');

        const created = await prisma.users.create({
            data: {
                id,
                username: validatedData.username,
                password: validatedData.password,
                created_at: new Date(),
            },
        });

        return created;
    }
}

export default UserService;