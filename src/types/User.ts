import { z } from 'zod';
import { ObjectId } from 'mongodb';

// User schema for authentication
export const UserSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  createdAt: z.date().optional(),
});

export type User = z.infer<typeof UserSchema>;

// Input type (what we send TO the server/database - without _id)
export type UserInput = Omit<User, '_id'>;

// Response type (what we receive FROM the server/database - with _id)
export type UserResponse = User & { _id: ObjectId };

// Auth request schemas
export const RegisterSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;

// Auth response types
export interface AuthResponse {
  token: string;
  message: string;
}

export interface VerifyResponse {
  valid: boolean;
  username?: string;
  message?: string;
}
