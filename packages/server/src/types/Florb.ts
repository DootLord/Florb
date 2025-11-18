import { z } from 'zod';

// Enum-like constants for rarity levels (ordered from common to mythic)
export const RARITY_LEVELS = [
  'Common',    // Basic florbs
  'Rare',      // Uncommon florbs
  'Epic',      // Rare florbs
  'Legendary'  // Ultra-rare florbs
] as const;

// Mapping from color rarity to actual rarity name
export const RARITY_NAMES = {
  Common: 'Common',
  Rare: 'Rare',
  Epic: 'Epic',
  Legendary: 'Legendary'
} as const;

// Enum-like constants for special effects
export const SPECIAL_EFFECTS = [
  'Holo',
  'Foil',
  'Shimmer',
  'Glow'
] as const;

// Color palette for each rarity - designed for gradient overlays
// Each rarity uses the full color spectrum but with different saturation levels
export const RARITY_COLOR_PALETTES = {
  Common: ['#B0B0B0', '#C0C0C0', '#D0D0D0', '#E0E0E0'], // Low saturation, lighter tones
  Rare: ['#4A7C59', '#5B8C6B', '#6B9C7B', '#7BAC8B'], // Moderate saturation, natural tones
  Epic: ['#7744AA', '#8855BB', '#9966CC', '#AA77DD'], // High saturation, rich colors
  Legendary: ['#FF0033', '#00FF33', '#3300FF', '#FFFF00', '#FF3300', '#33FF00', '#0033FF', '#FF00FF'] // Maximum saturation, full rainbow spectrum
} as const;

// Resource types that can be gathered
export const RESOURCE_TYPES = [
  'crystal',
  'energy',
  'metal'
] as const;

export type ResourceType = typeof RESOURCE_TYPES[number];

// Rarity effects on gathering
export const RARITY_GATHERING_EFFECTS = {
  Common: { radius: 50, durationHours: 1, throughputMultiplier: 0.5 },
  Rare: { radius: 100, durationHours: 4, throughputMultiplier: 1.0 },
  Epic: { radius: 200, durationHours: 12, throughputMultiplier: 2.0 },
  Legendary: { radius: 500, durationHours: 48, throughputMultiplier: 5.0 }
} as const;

// Resource node schema
export const ResourceNodeSchema = z.object({
  id: z.string().optional(),
  position: z.tuple([z.number().min(-90).max(90), z.number().min(-180).max(180)]), // [latitude, longitude]
  type: z.enum(RESOURCE_TYPES),
  amount: z.number().min(0),
});

export type ResourceNode = z.infer<typeof ResourceNodeSchema>;

// Input type (what we send TO the server/database - without _id)
export type ResourceNodeInput = Omit<ResourceNode, 'id'>;

// Response type (what we receive FROM the server/database - with id)
export type ResourceNodeResponse = ResourceNode & { id: string };

// Gradient configuration
export const GradientConfigSchema = z.object({
  colors: z.array(z.string()).min(2, 'Gradient needs at least 2 colors'),
  direction: z.enum(['horizontal', 'vertical', 'diagonal', 'radial']),
  intensity: z.number().min(0).max(1), // 0-1 for blend intensity
});

// Placed Florb schema (for world map)
export const PlacedFlorbSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  florbData: z.object({
    florbId: z.string(),
    name: z.string(),
    baseImagePath: z.string(),
    rarity: z.enum(RARITY_LEVELS),
    specialEffects: z.array(z.enum(SPECIAL_EFFECTS)),
    gradientConfig: GradientConfigSchema.optional(),
  }),
  position: z.tuple([z.number().min(-90).max(90), z.number().min(-180).max(180)]), // [latitude, longitude]
  placedAt: z.date(),
  gatheringRadius: z.number().min(0),
  duration: z.number().min(0), // in hours
  effectiveness: z.number().min(0), // multiplier
  lastGathered: z.date().optional(),
  totalGathered: z.object({
    crystal: z.number().min(0),
    energy: z.number().min(0),
    metal: z.number().min(0),
  }).optional(),
});

export type PlacedFlorb = z.infer<typeof PlacedFlorbSchema>;

// Input type (what we send TO the server/database - without _id)
export type PlacedFlorbInput = Omit<PlacedFlorb, 'id'>;

// Response type (what we receive FROM the server/database - with id)
export type PlacedFlorbResponse = PlacedFlorb & { id: string };

// Player resources schema
export const PlayerResourcesSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  crystal: z.number().min(0),
  energy: z.number().min(0),
  metal: z.number().min(0),
  updatedAt: z.date().optional(),
});

export type PlayerResources = z.infer<typeof PlayerResourcesSchema>;

// Input type (what we send TO the server/database - without _id)
export type PlayerResourcesInput = Omit<PlayerResources, 'id'>;

// Response type (what we receive FROM the server/database - with id)
export type PlayerResourcesResponse = PlayerResources & { id: string };

// Gathering analytics schema
export const GatheringAnalyticsSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  gathered: z.object({
    crystal: z.number().min(0),
    energy: z.number().min(0),
    metal: z.number().min(0),
  }),
  timestamp: z.date(),
});

export type GatheringAnalytics = z.infer<typeof GatheringAnalyticsSchema>;

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
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  placedAt: z.date().optional(),
  expiresAt: z.date().optional(),
});

// Full florb schema (matches Prisma florbs model - snake_case)
export const FlorbSchema = z.object({
  id: z.string(),
  base_image_path: z.string().nullable(),
  florb_id: z.string().nullable(),
  rarity: z.string().nullable(),
  gradient_colors: z.any().nullable(), // Json
  gradient_direction: z.string().nullable(),
  gradient_intensity: z.number().nullable(),
  description: z.string().nullable(),
  tags: z.any().nullable(), // Json
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
  collection_id: z.string().nullable(),
  special_effects: z.array(z.string()),
});

// Schema for florb generation request
export const GenerateFlorbSchema = z.object({
  baseImagePath: z.string().min(1, 'Base image path is required').optional(), // Optional - will pick randomly if not provided
  rarity: z.enum(RARITY_LEVELS).optional(),
  forceSpecialEffect: z.enum(SPECIAL_EFFECTS).optional(),
  customGradient: GradientConfigSchema.optional(),
}).optional().default({}); // Make the entire object optional with empty object as default

// Schema for batch florb generation
export const BatchGenerateFlorbSchema = z.object({
  count: z.number().min(1).max(100, 'Cannot generate more than 100 florbs at once'),
  baseImagePaths: z.array(z.string()).optional(), // If not provided, random selection
  rarityWeights: z.record(z.enum(RARITY_LEVELS), z.number()).optional(), // Custom rarity distribution
});

// Schema for placing a florb on the world map
export const PlaceFlorbSchema = z.object({
  florbId: z.string().min(1, 'Florb ID is required'),
  latitude: z.number().min(-90).max(90, 'Invalid latitude'),
  longitude: z.number().min(-180).max(180, 'Invalid longitude'),
});

// Schema for gathering resources from a florb
export const GatherResourcesSchema = z.object({
  florbId: z.string().min(1, 'Florb ID is required'),
  resourceType: z.enum(RESOURCE_TYPES).optional(), // Optional - gather all if not specified
});

// Infer TypeScript types from Zod schemas
export type Florb = z.infer<typeof FlorbSchema>;
export type CreateFlorbDto = z.infer<typeof CreateFlorbSchema>;
export type UpdateFlorbDto = z.infer<typeof UpdateFlorbSchema>;
export type GradientConfig = z.infer<typeof GradientConfigSchema>;
export type GenerateFlorbDto = z.infer<typeof GenerateFlorbSchema>;
export type BatchGenerateFlorbDto = z.infer<typeof BatchGenerateFlorbSchema>;
export type PlaceFlorbDto = z.infer<typeof PlaceFlorbSchema>;
export type GatherResourcesDto = z.infer<typeof GatherResourcesSchema>;
export type RarityLevel = typeof RARITY_LEVELS[number];
export type SpecialEffect = typeof SPECIAL_EFFECTS[number];

// Helper type for rarity weights
export type RarityWeights = {
  [K in RarityLevel]: number;
};

// Default rarity weights (higher numbers = more common)
// Designed like a trading card game distribution
export const DEFAULT_RARITY_WEIGHTS: RarityWeights = {
  Common: 70,     // Very common - basic florbs
  Rare: 20,       // Uncommon - harder to find
  Epic: 8,        // Rare - quite valuable
  Legendary: 2    // Ultra-rare - collector's items
};
