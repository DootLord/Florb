import { Collection, ObjectId } from 'mongodb';
import { connectToDatabase } from '../db/connection.js';
import {
    RARITY_LEVELS,
    SPECIAL_EFFECTS,
    RARITY_COLOR_PALETTES,
    DEFAULT_RARITY_WEIGHTS
} from '../types/Florb.js';
import type {
    Florb,
    CreateFlorbDto,
    UpdateFlorbDto,
    GenerateFlorbDto,
    BatchGenerateFlorbDto,
    RarityLevel,
    SpecialEffect,
    GradientConfig,
    RarityWeights
} from '../types/Florb.js';
import { randomBytes } from 'crypto';
import { readdir } from 'fs/promises';
import { join } from 'path';

export class FlorbService {
    private collection: Collection<Florb> | null = null;

    private async getCollection(): Promise<Collection<Florb>> {
        if (!this.collection) {
            const db = await connectToDatabase();
            this.collection = db.collection<Florb>('florbs');
        }
        return this.collection;
    }

    // Generate a unique florb ID
    private generateFlorbId(): string {
        return `florb_${randomBytes(8).toString('hex')}`;
    }

    // Generate a random rarity based on weights
    private generateRandomRarity(weights: RarityWeights = DEFAULT_RARITY_WEIGHTS): RarityLevel {
        const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
        const random = Math.random() * totalWeight;

        let currentWeight = 0;
        for (const [rarity, weight] of Object.entries(weights)) {
            currentWeight += weight;
            if (random <= currentWeight) {
                return rarity as RarityLevel;
            }
        }

        return 'Grey'; // Fallback
    }

    // Generate random special effects (with low probability)
    private generateRandomSpecialEffects(): SpecialEffect[] {
        const effects: SpecialEffect[] = [];
        const effectProbability = 0.15; // 15% chance for any special effect

        for (const effect of SPECIAL_EFFECTS) {
            if (effect === 'None') continue;

            // Higher rarity effects have lower probability
            let probability = effectProbability;
            if (effect === 'Holographic') probability = 0.1;
            if (effect === 'Rainbow' || effect === 'Prismatic') probability = 0.05;
            if (effect === 'Animated') probability = 0.03;
            if (effect === 'Glitch') probability = 0.02;

            if (Math.random() < probability) {
                effects.push(effect);
            }
        }

        return effects.length > 0 ? effects : ['None'];
    }

    // Generate gradient config based on rarity
    private generateGradientConfig(rarity: RarityLevel, customColors?: string[]): GradientConfig {
        const colors = customColors || RARITY_COLOR_PALETTES[rarity];
        const directions: Array<'horizontal' | 'vertical' | 'diagonal' | 'radial'> = ['horizontal', 'vertical', 'diagonal', 'radial'];
        const randomDirection = directions[Math.floor(Math.random() * directions.length)]!;

        // Higher rarity = higher intensity
        const rarityIndex = RARITY_LEVELS.indexOf(rarity);
        const intensity = 0.3 + (rarityIndex / (RARITY_LEVELS.length - 1)) * 0.7;

        return {
            colors: [...colors],
            direction: randomDirection,
            intensity: Math.round(intensity * 100) / 100
        };
    }

    // Get available base images by scanning the florb_base directory
    private async getAvailableBaseImages(): Promise<string[]> {
        try {
            const baseImageDir = join(process.cwd(), 'src', 'assets', 'florb_base');
            const files = await readdir(baseImageDir);
            const imageFiles = files
                .filter(file => file.match(/\.(png|jpg|jpeg|gif|bmp|webp)$/i))
                .map(file => `src/assets/florb_base/${file}`);
            
            if (imageFiles.length === 0) {
                console.warn('No image files found in florb_base directory. Using fallback images.');
                return [
                    'src/assets/florb_base/default_orb.png',
                    'src/assets/florb_base/default_crystal.png'
                ];
            }
            
            console.log(`Found ${imageFiles.length} base images:`, imageFiles);
            return imageFiles;
        } catch (error) {
            console.warn('Could not read florb_base directory:', error);
            console.warn('Using fallback base images.');
            return [
                'src/assets/florb_base/default_orb.png',
                'src/assets/florb_base/default_crystal.png'
            ];
        }
    }

    // Generate a single florb
    async generateFlorb(data: GenerateFlorbDto): Promise<Florb> {
        const collection = await this.getCollection();

        // Get base image path - either provided or pick randomly
        let baseImagePath = data.baseImagePath;
        if (!baseImagePath) {
            const availableImages = await this.getAvailableBaseImages();
            baseImagePath = availableImages[Math.floor(Math.random() * availableImages.length)]!;
        }

        // Determine rarity
        const rarity = data.rarity || this.generateRandomRarity();

        // Generate special effects
        const specialEffects = data.forceSpecialEffect
            ? [data.forceSpecialEffect]
            : this.generateRandomSpecialEffects();

        // Generate gradient config
        const gradientConfig = data.customGradient || this.generateGradientConfig(rarity);

        // Create the florb
        const florb: Omit<Florb, '_id'> = {
            florbId: this.generateFlorbId(),
            name: `${rarity} Florb`,
            baseImagePath,
            rarity,
            specialEffects,
            gradientConfig,
            description: `A ${rarity.toLowerCase()} rarity florb with ${specialEffects.join(', ').toLowerCase()} effects.`,
            tags: [rarity.toLowerCase(), ...specialEffects.map(e => e.toLowerCase())],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await collection.insertOne(florb);
        return { ...florb, _id: result.insertedId };
    }

    // Generate multiple florbs
    async batchGenerateFlorbs(data: BatchGenerateFlorbDto): Promise<Florb[]> {
        const availableImages = data.baseImagePaths || await this.getAvailableBaseImages();
        const rarityWeights = data.rarityWeights || DEFAULT_RARITY_WEIGHTS;
        const florbs: Florb[] = [];

        for (let i = 0; i < data.count; i++) {
            const randomImagePath = availableImages[Math.floor(Math.random() * availableImages.length)]!;
            const rarity = this.generateRandomRarity(rarityWeights);

            const generateData: GenerateFlorbDto = {
                baseImagePath: randomImagePath,
                rarity
            };

            const florb = await this.generateFlorb(generateData);
            florbs.push(florb);
        }

        return florbs;
    }

    // Create a custom florb
    async createFlorb(data: CreateFlorbDto): Promise<Florb> {
        const collection = await this.getCollection();

        const florb: Omit<Florb, '_id'> = {
            ...data,
            florbId: this.generateFlorbId(),
            gradientConfig: data.gradientConfig || this.generateGradientConfig(
                data.rarity,
                data.customColors
            ),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await collection.insertOne(florb);
        return { ...florb, _id: result.insertedId };
    }

    // Get all florbs with pagination
    async getAllFlorbs(page = 1, limit = 20, rarity?: RarityLevel): Promise<{ florbs: Florb[], total: number, page: number, totalPages: number }> {
        const collection = await this.getCollection();
        const skip = (page - 1) * limit;

        const filter = rarity ? { rarity } : {};

        const [florbs, total] = await Promise.all([
            collection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
            collection.countDocuments(filter)
        ]);

        return {
            florbs,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    // Get florb by ID
    async getFlorbById(id: string): Promise<Florb | null> {
        const collection = await this.getCollection();
        return await collection.findOne({ _id: new ObjectId(id) });
    }

    // Get florb by florb ID
    async getFlorbByFlorbId(florbId: string): Promise<Florb | null> {
        const collection = await this.getCollection();
        return await collection.findOne({ florbId });
    }

    // Update florb
    async updateFlorb(id: string, data: UpdateFlorbDto): Promise<Florb | null> {
        const collection = await this.getCollection();

        // Only include defined properties in the update
        const updateData: Partial<Florb> = {
            updatedAt: new Date()
        };

        if (data.name !== undefined) updateData.name = data.name;
        if (data.rarity !== undefined) updateData.rarity = data.rarity;
        if (data.specialEffects !== undefined) updateData.specialEffects = data.specialEffects;
        if (data.gradientConfig !== undefined) updateData.gradientConfig = data.gradientConfig;
        if (data.customColors !== undefined) updateData.customColors = data.customColors;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.tags !== undefined) updateData.tags = data.tags;

        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        return result || null;
    }

    // Delete florb
    async deleteFlorb(id: string): Promise<boolean> {
        const collection = await this.getCollection();
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }

    // Get florbs by rarity
    async getFlorbsByRarity(rarity: RarityLevel): Promise<Florb[]> {
        const collection = await this.getCollection();
        return await collection.find({ rarity }).sort({ createdAt: -1 }).toArray();
    }

    // Get florbs with special effects
    async getFlorbsWithEffect(effect: SpecialEffect): Promise<Florb[]> {
        const collection = await this.getCollection();
        return await collection.find({ specialEffects: effect }).sort({ createdAt: -1 }).toArray();
    }

    // Get rarity distribution statistics
    async getRarityStats(): Promise<Record<RarityLevel, number>> {
        const collection = await this.getCollection();
        const pipeline = [
            {
                $group: {
                    _id: '$rarity',
                    count: { $sum: 1 }
                }
            }
        ];

        const results = await collection.aggregate(pipeline).toArray();
        const stats: Record<string, number> = {};

        // Initialize all rarities with 0
        RARITY_LEVELS.forEach(rarity => {
            stats[rarity] = 0;
        });

        // Fill in actual counts
        results.forEach(result => {
            stats[result._id] = result.count;
        });

        return stats as Record<RarityLevel, number>;
    }

    // Get list of available base images
    async getBaseImagesList(): Promise<string[]> {
        return await this.getAvailableBaseImages();
    }
}
