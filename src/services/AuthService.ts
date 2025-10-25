import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../db/prisma.js';
import { RegisterDto, LoginDto, AuthResponse, VerifyResponse } from '../types/User.js';

export class AuthService {
    private jwtSecret: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    constructor() {}

    // Register a new user using Prisma
    async register(userData: RegisterDto): Promise<AuthResponse> {
        // Check if user already exists
        const existingUser = await prisma.users.findFirst({ where: { username: userData.username } });
        if (existingUser) {
            throw new Error('Username already exists');
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        // Generate a UUID for the new user id (DB may also have defaults; explicit is safer here)
        const id = (crypto as any).randomUUID ? (crypto as any).randomUUID() : crypto.randomBytes(16).toString('hex');

        const created = await prisma.users.create({
            data: {
                id,
                username: userData.username,
                password: hashedPassword,
                created_at: new Date(),
            },
        });

        // Generate JWT token
        const token = jwt.sign({ userId: created.id, username: created.username }, this.jwtSecret, { expiresIn: '24h' });

        return {
            token,
            message: 'User registered successfully',
        };
    }

    // Login user
    async login(credentials: LoginDto): Promise<AuthResponse> {
        // Find user by username
        const user = await prisma.users.findFirst({ where: { username: credentials.username } });
        if (!user || !user.password) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id, username: user.username }, this.jwtSecret, { expiresIn: '24h' });

        return {
            token,
            message: 'Login successful',
        };
    }

    // Verify JWT token
    async verifyToken(token: string): Promise<VerifyResponse> {
        try {
            const decoded = jwt.verify(token, this.jwtSecret) as { userId: string; username: string };

            // Check if user still exists
            const user = await prisma.users.findUnique({ where: { id: decoded.userId } });
            if (!user) return { valid: false, message: 'User not found' };

            return { valid: true, username: user.username || undefined };
        } catch (error) {
            return { valid: false, message: 'Invalid or expired token' };
        }
    }

    // Get user by ID (for middleware)
    async getUserById(userId: string): Promise<any | null> {
        return prisma.users.findUnique({ where: { id: userId } });
    }
}