import { RegisterSchema } from '../types/User.js';
import { prisma } from '../db/prisma.js';

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

        const created = await prisma.users.create({
            data: {
                username: validatedData.username,
                password: validatedData.password,
                created_at: new Date(),
            },
        });

        return created;
    }
}

export default UserService;