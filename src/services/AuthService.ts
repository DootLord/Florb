import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Collection, ObjectId } from 'mongodb';
import { connectToDatabase } from '../db/connection.js';
import { User, UserInput, RegisterDto, LoginDto, AuthResponse, VerifyResponse } from '../types/User.js';

export class AuthService {
    private userCollection: Collection<User> | null = null;
    private jwtSecret: string;

    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    }

    private async getUserCollection(): Promise<Collection<User>> {
        if (!this.userCollection) {
            const db = await connectToDatabase();
            this.userCollection = db.collection<User>('users');
        }
        return this.userCollection;
    }

    // Register a new user
    async register(userData: RegisterDto): Promise<AuthResponse> {
        const collection = await this.getUserCollection();

        // Check if user already exists
        const existingUser = await collection.findOne({ username: userData.username });
        if (existingUser) {
            throw new Error('Username already exists');
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        // Create user
        const newUser: UserInput = {
            username: userData.username,
            password: hashedPassword,
            createdAt: new Date()
        };

        const result = await collection.insertOne(newUser);

        if (!result.insertedId) {
            throw new Error('Failed to create user');
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: result.insertedId.toString(), username: userData.username },
            this.jwtSecret,
            { expiresIn: '24h' }
        );

        return {
            token,
            message: 'User registered successfully'
        };
    }

    // Login user
    async login(credentials: LoginDto): Promise<AuthResponse> {
        const collection = await this.getUserCollection();

        // Find user
        const user = await collection.findOne({ username: credentials.username });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id!.toString(), username: user.username },
            this.jwtSecret,
            { expiresIn: '24h' }
        );

        return {
            token,
            message: 'Login successful'
        };
    }

    // Verify JWT token
    async verifyToken(token: string): Promise<VerifyResponse> {
        try {
            const decoded = jwt.verify(token, this.jwtSecret) as { userId: string; username: string };

            // Check if user still exists
            const collection = await this.getUserCollection();
            const user = await collection.findOne({ _id: new ObjectId(decoded.userId) });

            if (!user) {
                return { valid: false, message: 'User not found' };
            }

            return { valid: true, username: user.username };
        } catch (error) {
            return { valid: false, message: 'Invalid or expired token' };
        }
    }

    // Get user by ID (for middleware)
    async getUserById(userId: string): Promise<User | null> {
        const collection = await this.getUserCollection();
        return await collection.findOne({ _id: new ObjectId(userId) });
    }
}