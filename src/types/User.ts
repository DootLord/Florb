import { z } from 'zod';
import { ObjectId } from 'mongodb';

// Zod schema for creating a user
export const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
});

// Zod schema for updating a user
export const UpdateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  email: z.string().email('Invalid email format').optional(),
});

// Full user schema (includes database fields)
export const UserSchema = CreateUserSchema.extend({
  _id: z.instanceof(ObjectId).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Infer TypeScript types from Zod schemas
export type User = z.infer<typeof UserSchema>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
