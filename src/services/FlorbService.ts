import { prisma } from '../db/prisma.js';
import {
    RARITY_LEVELS,
    SPECIAL_EFFECTS,
    RARITY_COLOR_PALETTES,
    DEFAULT_RARITY_WEIGHTS,
    RARITY_NAMES
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
    // Normalize DB record (Prisma) into app-friendly Florb shape (camelCase)
    private normalizeFlorbRecord(record: any): Florb {
        if (!record) return record;

        const rarity: RarityLevel = (record.rarity as RarityLevel) || 'Common';

        return {
            id: record.id,
            florbId: record.florb_id || undefined,
            name: record.name || `${RARITY_NAMES[rarity]} Florb`,
            baseImagePath: record.base_image_path,
            rarity,
            specialEffects: (record.special_effects as string[]) || [],
            gradientConfig: record.gradient_colors ? {
                colors: record.gradient_colors,
                direction: record.gradient_direction,
                intensity: record.gradient_intensity
            } as GradientConfig : undefined,
            description: record.description || '',
            tags: record.tags || [],
            createdAt: record.created_at ? new Date(record.created_at) : undefined,
            updatedAt: record.updated_at ? new Date(record.updated_at) : undefined
        } as Florb;
    }

    private generateFlorbId(): string {
        return `florb_${randomBytes(8).toString('hex')}`;
    }

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

        return 'Legendary';
    }

    private generateRandomSpecialEffects(): SpecialEffect[] {
        const effects: SpecialEffect[] = [];
        const effectProbability = 0.15;

        for (const effect of SPECIAL_EFFECTS) {
            let probability = effectProbability;
            if (effect === 'Holo') probability = 0.1;
            if (effect === 'Foil') probability = 0.08;
            if (effect === 'Shimmer') probability = 0.05;
            if (effect === 'Glow') probability = 0.03;

            if (Math.random() < probability) effects.push(effect as SpecialEffect);
        }

        return effects.length > 0 ? effects : [];
    }

    private generateGradientConfig(rarity: RarityLevel, customColors?: string[]) {
        let colors: string[];
        if (customColors) colors = customColors;
        else {
            const rarityPalette = RARITY_COLOR_PALETTES[rarity];
            const colorCount = Math.min(3 + Math.floor(Math.random() * 3), rarityPalette.length);
            colors = this.getRandomColorsFromPalette(rarityPalette, colorCount);
        }

        const directions: Array<'horizontal' | 'vertical' | 'diagonal' | 'radial'> = ['horizontal', 'vertical', 'diagonal', 'radial'];
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];

        const rarityIndex = RARITY_LEVELS.indexOf(rarity);
        const intensityBase = 0.2 + (rarityIndex / (RARITY_LEVELS.length - 1)) * 0.8;
        const intensity = Math.round(Math.pow(intensityBase, 0.7) * 100) / 100;

        return { colors, direction: randomDirection, intensity };
    }

    private getRandomColorsFromPalette(palette: readonly string[], count: number): string[] {
        const selectedColors: string[] = [];
        const availableColors = [...palette];
        const actualCount = Math.min(count, availableColors.length);
        for (let i = 0; i < actualCount; i++) {
            const randomIndex = Math.floor(Math.random() * availableColors.length);
            const selected = availableColors.splice(randomIndex, 1)[0];
            if (selected) selectedColors.push(selected);
        }
        return selectedColors;
    }

    private async getAvailableBaseImages(): Promise<string[]> {
        try {
            const baseImageDir = join(process.cwd(), 'src', 'assets', 'florb_base');
            const files = await readdir(baseImageDir);
            const imageFiles = files.filter(f => f.match(/\.(png|jpg|jpeg|gif|bmp|webp)$/i)).map(f => `src/assets/florb_base/${f}`);
            if (imageFiles.length === 0) return ['src/assets/florb_base/default_orb.png', 'src/assets/florb_base/default_crystal.png'];
            return imageFiles;
        } catch (e) {
            return ['src/assets/florb_base/default_orb.png', 'src/assets/florb_base/default_crystal.png'];
        }
    }

    // Generate a single florb (creates a template in `florbs` table)
    async generateFlorb(data: GenerateFlorbDto, _userId?: string): Promise<Florb> {
        let baseImagePath = data.baseImagePath;
        if (!baseImagePath) {
            const images = await this.getAvailableBaseImages();
            baseImagePath = images[Math.floor(Math.random() * images.length)];
        }

        const rarity = data.rarity || this.generateRandomRarity();
        const specialEffects = data.forceSpecialEffect ? [data.forceSpecialEffect] : this.generateRandomSpecialEffects();
        const gradient = data.customGradient || this.generateGradientConfig(rarity);

        const florbRecord = await prisma.florbs.create({
            data: {
                base_image_path: baseImagePath,
                florb_id: this.generateFlorbId(),
                rarity,
                special_effects: specialEffects,
                gradient_colors: gradient.colors,
                gradient_direction: gradient.direction,
                gradient_intensity: gradient.intensity,
                description: `A ${RARITY_NAMES[rarity].toLowerCase()} rarity florb with ${specialEffects.join(', ').toLowerCase()} effects.`,
                tags: [RARITY_NAMES[rarity].toLowerCase(), ...specialEffects.map(e => e.toLowerCase())],
                created_at: new Date(),
                updated_at: new Date(),
            }
        });

        return this.normalizeFlorbRecord(florbRecord);
    }

    async batchGenerateFlorbs(data: BatchGenerateFlorbDto, userId: string = 'NO_USER'): Promise<Florb[]> {
        const availableImages = data.baseImagePaths || await this.getAvailableBaseImages();
        const rarityWeights = data.rarityWeights || DEFAULT_RARITY_WEIGHTS;
        const results: Florb[] = [];
        for (let i = 0; i < data.count; i++) {
            const img = availableImages[Math.floor(Math.random() * availableImages.length)];
            const rarity = this.generateRandomRarity(rarityWeights);
            const florb = await this.generateFlorb({ baseImagePath: img, rarity }, userId);
            results.push(florb);
        }
        return results;
    }

    async createFlorb(data: CreateFlorbDto, _userId?: string): Promise<Florb> {
        const gradient = data.gradientConfig || this.generateGradientConfig(data.rarity, (data as any).customColors);
        const florbRecord = await prisma.florbs.create({
            data: {
                base_image_path: data.baseImagePath,
                florb_id: this.generateFlorbId(),
                rarity: data.rarity,
                special_effects: data.specialEffects,
                gradient_colors: gradient.colors,
                gradient_direction: gradient.direction,
                gradient_intensity: gradient.intensity,
                description: data.description || undefined,
                tags: data.tags || [],
                created_at: new Date(),
                updated_at: new Date(),
            }
        });
        return this.normalizeFlorbRecord(florbRecord);
    }

    async getAllFlorbs(page = 1, limit = 20, rarity?: RarityLevel) {
        const skip = (page - 1) * limit;
        const where: any = {};
        if (rarity) where.rarity = rarity;

        const [florbs, total] = await Promise.all([
            prisma.florbs.findMany({ where, orderBy: { created_at: 'desc' }, skip, take: limit }),
            prisma.florbs.count({ where })
        ]);

        return {
            florbs: florbs.map(this.normalizeFlorbRecord.bind(this)),
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    async getFlorbById(id: string): Promise<Florb | null> {
        const record = await prisma.florbs.findUnique({ where: { id } });
        return record ? this.normalizeFlorbRecord(record) : null;
    }

    async getFlorbByFlorbId(florbId: string): Promise<Florb | null> {
        const record = await prisma.florbs.findFirst({ where: { florb_id: florbId } });
        return record ? this.normalizeFlorbRecord(record) : null;
    }

    async updateFlorb(id: string, data: UpdateFlorbDto): Promise<Florb | null> {
        const updateData: any = { updated_at: new Date() };
        if (data.rarity !== undefined) updateData.rarity = data.rarity;
        if (data.specialEffects !== undefined) updateData.special_effects = data.specialEffects;
        if (data.gradientConfig !== undefined) {
            updateData.gradient_colors = data.gradientConfig.colors;
            updateData.gradient_direction = data.gradientConfig.direction;
            updateData.gradient_intensity = data.gradientConfig.intensity;
        }
        if ((data as any).customColors !== undefined) updateData.gradient_colors = (data as any).customColors;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.tags !== undefined) updateData.tags = data.tags;

        const updated = await prisma.florbs.update({ where: { id }, data: updateData });
        return this.normalizeFlorbRecord(updated);
    }

    async deleteFlorb(id: string): Promise<boolean> {
        try {
            await prisma.florbs.delete({ where: { id } });
            return true;
        } catch (e) {
            return false;
        }
    }

    async getFlorbsByRarity(rarity: RarityLevel): Promise<Florb[]> {
        const records = await prisma.florbs.findMany({ where: { rarity }, orderBy: { created_at: 'desc' } });
        return records.map(this.normalizeFlorbRecord.bind(this));
    }

    async getFlorbsWithEffect(effect: SpecialEffect): Promise<Florb[]> {
        // Prisma JSON contains queries vary by provider; fetch and filter in JS for correctness
    const records = await prisma.florbs.findMany({ orderBy: { created_at: 'desc' } });
    return records.filter((r: any) => Array.isArray(r.special_effects) && r.special_effects.includes(effect)).map(this.normalizeFlorbRecord.bind(this));
    }

    async getRarityStats(): Promise<Record<RarityLevel, number>> {
        const groups = await (prisma as any).florbs.groupBy({ by: ['rarity'], _count: { _all: true } });
        const stats: Record<RarityLevel, number> = {
            Common: 0,
            Rare: 0,
            Epic: 0,
            Legendary: 0
        };
        for (const g of groups) {
            if (g.rarity) stats[g.rarity as RarityLevel] = g._count._all || 0;
        }
        return stats;
    }

    async getBaseImagesList(): Promise<string[]> {
        return this.getAvailableBaseImages();
    }

    async getRarityNameMappings(): Promise<Record<RarityLevel, string>> {
        return RARITY_NAMES;
    }

    // Get all placed florbs on the world map (joins template florb data)
    async getPlacedFlorbs(): Promise<Florb[]> {
        const placed = await prisma.placed_florbs.findMany({ include: { florbs: true }, orderBy: { created_at: 'desc' } });
        // Map to Florb-like objects by combining placement + template
        return placed.map((p: any) => {
            const template = p.florbs;
            const normalized = this.normalizeFlorbRecord(template || {});
            // attach placement info
            return { ...normalized, placedAt: p.created_at ? new Date(p.created_at) : undefined, userId: p.user_id } as Florb;
        });
    }

    // Get florbs placed by a user (pagination)
    async getUserFlorbs(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [placements, total] = await Promise.all([
            prisma.placed_florbs.findMany({ where: { user_id: userId }, include: { florbs: true }, orderBy: { created_at: 'desc' }, skip, take: limit }),
            prisma.placed_florbs.count({ where: { user_id: userId } })
        ]);

        const florbs = placements.map((p: any) => {
            const normalized = this.normalizeFlorbRecord(p.florbs || {});
            return { ...normalized, placedAt: p.created_at ? new Date(p.created_at) : undefined, userId: p.user_id } as Florb;
        });

        return { florbs, total, page, totalPages: Math.ceil(total / limit) };
    }

    async getUserFlorbCount(userId: string): Promise<number> {
        return prisma.placed_florbs.count({ where: { user_id: userId } });
    }

    async getUserRareFlorbCount(userId: string): Promise<number> {
        // Count placements whose template has a high rarity
        return prisma.placed_florbs.count({ where: { user_id: userId, florbs: { rarity: { in: ['Rare', 'Epic', 'Legendary'] } } } });
    }
}
