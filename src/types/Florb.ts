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

// Mapping from color rarity to actual rarity name
export const RARITY_NAMES = {
  Grey: 'Common',
  White: 'Common',
  Green: 'Uncommon',
  Blue: 'Rare',
  Purple: 'Epic',
  Orange: 'Legendary',
  Red: 'Mythic'
} as const;

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
// Each rarity uses the full color spectrum but with different saturation levels
export const RARITY_COLOR_PALETTES = {
  Grey: ['#505050', '#606060', '#555555', '#4A4A4A'], // Very dull, desaturated (any hue but no saturation)
  White: ['#B0B0B0', '#C0C0C0', '#D0D0D0', '#E0E0E0'], // Low saturation, lighter tones
  Green: ['#4A7C59', '#5B8C6B', '#6B9C7B', '#7BAC8B'], // Moderate saturation, natural tones
  Blue: ['#3366CC', '#4477DD', '#5588EE', '#6699FF'], // Good saturation, appealing colors
  Purple: ['#7744AA', '#8855BB', '#9966CC', '#AA77DD'], // High saturation, rich colors
  Orange: ['#CC3366', '#DD4477', '#EE5588', '#FF6699', '#AA77CC', '#BB88DD'], // Very high saturation, full spectrum
  Red: ['#FF0033', '#00FF33', '#3300FF', '#FFFF00', '#FF3300', '#33FF00', '#0033FF', '#FF00FF'] // Maximum saturation, full rainbow spectrum
} as const;

// Resource types that can be gathered
export const RESOURCE_TYPES = [
  'Shleep',
  'Mlorp',
  'Spoonch'
] as const;

export type ResourceType = typeof RESOURCE_TYPES[number];

// Rarity effects on gathering
export const RARITY_GATHERING_EFFECTS = {
  Grey: { radius: 50, durationHours: 1, throughputMultiplier: 0.5 },
  White: { radius: 75, durationHours: 2, throughputMultiplier: 0.75 },
  Green: { radius: 100, durationHours: 4, throughputMultiplier: 1.0 },
  Blue: { radius: 150, durationHours: 8, throughputMultiplier: 1.5 },
  Purple: { radius: 200, durationHours: 12, throughputMultiplier: 2.0 },
  Orange: { radius: 300, durationHours: 24, throughputMultiplier: 3.0 },
  Red: { radius: 500, durationHours: 48, throughputMultiplier: 5.0 }
} as const;

// Resource node schema
export const ResourceNodeSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  id: z.string(),
  position: z.tuple([z.number().min(-90).max(90), z.number().min(-180).max(180)]), // [latitude, longitude]
  type: z.enum(RESOURCE_TYPES),
  amount: z.number().min(0),
});

export type ResourceNode = z.infer<typeof ResourceNodeSchema>;

// Upstream type (what we send TO the server/database - without _id)
export type ResourceNodeUpstream = Omit<ResourceNode, '_id'>;

// Downstream type (what we receive FROM the server/database - with _id)
export type ResourceNodeDownstream = ResourceNode & { _id: ObjectId };

// Gradient configuration
export const GradientConfigSchema = z.object({
  colors: z.array(z.string()).min(2, 'Gradient needs at least 2 colors'),
  direction: z.enum(['horizontal', 'vertical', 'diagonal', 'radial']),
  intensity: z.number().min(0).max(1), // 0-1 for blend intensity
});

// Placed Florb schema (for world map)
export const PlacedFlorbSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  id: z.string(),
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
  placedAt: z.string(), // ISO date string
  gatheringRadius: z.number().min(0),
  duration: z.number().min(0), // in hours
  effectiveness: z.number().min(0), // multiplier
  lastGathered: z.string().optional(), // ISO date string
  totalGathered: z.object({
    Shleep: z.number().min(0),
    Mlorp: z.number().min(0),
    Spoonch: z.number().min(0),
  }).optional(),
});

export type PlacedFlorb = z.infer<typeof PlacedFlorbSchema>;

// Upstream type (what we send TO the server/database - without _id)
export type PlacedFlorbUpstream = Omit<PlacedFlorb, '_id'>;

// Downstream type (what we receive FROM the server/database - with _id)
export type PlacedFlorbDownstream = PlacedFlorb & { _id: ObjectId };

// Player resources schema
export const PlayerResourcesSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  userId: z.string(),
  Shleep: z.number().min(0),
  Mlorp: z.number().min(0),
  Spoonch: z.number().min(0),
  updatedAt: z.date().optional(),
});

export type PlayerResources = z.infer<typeof PlayerResourcesSchema>;

// Upstream type (what we send TO the server/database - without _id)
export type PlayerResourcesUpstream = Omit<PlayerResources, '_id'>;

// Downstream type (what we receive FROM the server/database - with _id)
export type PlayerResourcesDownstream = PlayerResources & { _id: ObjectId };

// Gathering analytics schema
export const GatheringAnalyticsSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  userId: z.string(),
  gathered: z.object({
    Shleep: z.number().min(0),
    Mlorp: z.number().min(0),
    Spoonch: z.number().min(0),
  }),
  timestamp: z.string(), // ISO date string
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

// Full florb schema (includes database fields)
export const FlorbSchema = CreateFlorbSchema.extend({
  _id: z.instanceof(ObjectId).optional(),
  florbId: z.string().optional(), // Unique identifier for the florb
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  generatedImageUrl: z.string().optional(), // URL to the generated image if cached
  // World map coordinates for placement
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  placedAt: z.date().optional(), // When the florb was placed on the map
  expiresAt: z.date().optional(), // When the florb expires based on rarity
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
  Grey: 45,    // Very common - plain, everyday florbs
  White: 30,   // Common - slightly better than grey
  Green: 15,   // Uncommon - noticeable but not rare
  Blue: 7,     // Rare - actually rare and desirable
  Purple: 2.5, // Epic - quite rare and special
  Orange: 0.8, // Legendary - very rare, highly sought after
  Red: 0.2     // Mythic - extremely rare, collector's dream
};
