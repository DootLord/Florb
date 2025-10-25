import { z } from 'zod';

// User schema for Postgres (UUID id, timestamp created_at)
export const UserSchema = z.object({
  id: z.string().uuid().optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  created_at: z.date().optional(),
});

export type User = z.infer<typeof UserSchema>;

// Input type (what we send TO the server/database - without id)
export type UserInput = Omit<User, 'id'>;

// Response type (what we receive FROM the server/database - with id)
export type UserResponse = User & { id: string };

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
