import { connectToDatabase } from "../db/connection.js";
import type { User, CreateUserDto } from "../types/User.js";
import { CreateUserSchema } from "../types/User.js";
import { ObjectId } from 'mongodb';

class UserService {
    private readonly collectionName = 'users';

    async getAllUsers(): Promise<User[]> {
        const db = await connectToDatabase();
        return db.collection<User>(this.collectionName).find().toArray();
    }

    async getUserById(id: string): Promise<User | null> {
        const db = await connectToDatabase();
        return db.collection<User>(this.collectionName).findOne({ 
            _id: new ObjectId(id) 
        });
    }

    async createUser(userData: unknown): Promise<User> {
        // Validate input with Zod
        const validatedData = CreateUserSchema.parse(userData);
        
        const db = await connectToDatabase();
        const user: Omit<User, '_id'> = {
            ...validatedData,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await db.collection<User>(this.collectionName).insertOne(user as User);
        return { ...user, _id: result.insertedId };
    }
}

export default UserService;