import { z } from 'zod';
import { ObjectId } from 'mongodb';

// Enum-like constants for rarity levels (ordered from common to mythic)
export const RARITY_LEVELS = [
  'Grey',    // Common - dull and basic
  'White',   // Common - subtle and plain  
  'Green',   // Uncommon - natural appearance
  'Blue',    // Rare - appealing and noticeable
  'Purple',  // Epic - magical and special
  'Orange',  // Legendary - fiery and impressive
  'Red'      // Mythic - maximum visual impact
] as const;

// Enum-like constants for special effects
export const SPECIAL_EFFECTS = [
  'None',
  'Holographic',
  'Foil',
  'Rainbow',
  'Glitch',
  'Animated',
  'Prismatic'
] as const;

// Color palette for each rarity - designed for gradient overlays
export const RARITY_COLOR_PALETTES = {
  Grey: ['#404040', '#606060', '#505050', '#454545'], // Dull greys
  White: ['#E8E8E8', '#F5F5F5', '#EFEFEF', '#E0E0E0'], // Soft whites and light greys
  Green: ['#228B22', '#32CD32', '#90EE90', '#00FF7F'], // Natural greens with some brightness
  Blue: ['#1E90FF', '#4169E1', '#00BFFF', '#87CEEB'], // Ocean blues, moderately vibrant
  Purple: ['#8A2BE2', '#9932CC', '#DA70D6', '#FF00FF'], // Rich purples with magical feel
  Orange: ['#FF4500', '#FF6347', '#FFA500', '#FFD700'], // Fiery oranges and golds
  Red: ['#DC143C', '#FF0000', '#FF1493', '#FF69B4', '#FF6347', '#FFD700'] // Intense reds with golden accents
} as const;

// Gradient configuration
export const GradientConfigSchema = z.object({
  colors: z.array(z.string()).min(2, 'Gradient needs at least 2 colors'),
  direction: z.enum(['horizontal', 'vertical', 'diagonal', 'radial']),
  intensity: z.number().min(0).max(1), // 0-1 for blend intensity
});

// Zod schema for creating a florb
export const CreateFlorbSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  baseImagePath: z.string().min(1, 'Base image path is required'),
  rarity: z.enum(RARITY_LEVELS),
  specialEffects: z.array(z.enum(SPECIAL_EFFECTS)).default([]),
  gradientConfig: GradientConfigSchema.optional(),
  customColors: z.array(z.string()).optional(), // Custom color override
  description: z.string().max(500, 'Description too long').optional(),
  tags: z.array(z.string()).default([]),
});

// Zod schema for updating a florb
export const UpdateFlorbSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  rarity: z.enum(RARITY_LEVELS).optional(),
  specialEffects: z.array(z.enum(SPECIAL_EFFECTS)).optional(),
  gradientConfig: GradientConfigSchema.optional(),
  customColors: z.array(z.string()).optional(),
  description: z.string().max(500, 'Description too long').optional(),
  tags: z.array(z.string()).optional(),
});

// Full florb schema (includes database fields)
export const FlorbSchema = CreateFlorbSchema.extend({
  _id: z.instanceof(ObjectId).optional(),
  florbId: z.string().optional(), // Unique identifier for the florb
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  generatedImageUrl: z.string().optional(), // URL to the generated image if cached
});

// Schema for florb generation request
export const GenerateFlorbSchema = z.object({
  baseImagePath: z.string().min(1, 'Base image path is required'),
  rarity: z.enum(RARITY_LEVELS).optional(),
  forceSpecialEffect: z.enum(SPECIAL_EFFECTS).optional(),
  customGradient: GradientConfigSchema.optional(),
});

// Schema for batch florb generation
export const BatchGenerateFlorbSchema = z.object({
  count: z.number().min(1).max(100, 'Cannot generate more than 100 florbs at once'),
  baseImagePaths: z.array(z.string()).optional(), // If not provided, random selection
  rarityWeights: z.record(z.enum(RARITY_LEVELS), z.number()).optional(), // Custom rarity distribution
});

// Infer TypeScript types from Zod schemas
export type Florb = z.infer<typeof FlorbSchema>;
export type CreateFlorbDto = z.infer<typeof CreateFlorbSchema>;
export type UpdateFlorbDto = z.infer<typeof UpdateFlorbSchema>;
export type GradientConfig = z.infer<typeof GradientConfigSchema>;
export type GenerateFlorbDto = z.infer<typeof GenerateFlorbSchema>;
export type BatchGenerateFlorbDto = z.infer<typeof BatchGenerateFlorbSchema>;
export type RarityLevel = typeof RARITY_LEVELS[number];
export type SpecialEffect = typeof SPECIAL_EFFECTS[number];

// Helper type for rarity weights
export type RarityWeights = {
  [K in RarityLevel]: number;
};

// Default rarity weights (higher numbers = more common)
// Designed like a trading card game distribution
export const DEFAULT_RARITY_WEIGHTS: RarityWeights = {
  Grey: 45,    // Very common - plain, everyday florbs
  White: 30,   // Common - slightly better than grey
  Green: 15,   // Uncommon - noticeable but not rare
  Blue: 7,     // Rare - actually rare and desirable
  Purple: 2.5, // Epic - quite rare and special
  Orange: 0.8, // Legendary - very rare, highly sought after
  Red: 0.2     // Mythic - extremely rare, collector's dream
};
