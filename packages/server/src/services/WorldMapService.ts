import { prisma } from '../db/prisma.js';
import {
    ResourceNode,
    PlacedFlorb,
    PlayerResources,
    RESOURCE_TYPES,
    RARITY_GATHERING_EFFECTS,
    ResourceType
} from '../types/Florb.js';

export class WorldMapService {
    constructor() {}

    // Generate random resource nodes across the world and save to Postgres
    async generateResourceNodes(count: number = 100): Promise<ResourceNode[]> {
        const nodes: ResourceNode[] = [];

        for (let i = 0; i < count; i++) {
            const position: [number, number] = [
                (Math.random() - 0.5) * 180,
                (Math.random() - 0.5) * 360
            ];
            const type = RESOURCE_TYPES[Math.floor(Math.random() * RESOURCE_TYPES.length)] as ResourceType;
            const amount = Math.floor(Math.random() * 1000) + 1;

            const created = await prisma.resource_nodes.create({
                data: {
                    created_at: new Date(),
                    resource_type: type,
                    amount,
                    location: { lat: position[0], lon: position[1] }
                }
            });
            const locCreated = created.location as any || {};
            nodes.push({ id: created.id, position: [locCreated.lat ?? position[0], locCreated.lon ?? position[1]], type: created.resource_type as ResourceType, amount: created.amount ?? 0 } as ResourceNode);
        }

        return nodes;
    }

    // Get all resource nodes
    async getAllResourceNodes(): Promise<ResourceNode[]> {
        const records = await prisma.resource_nodes.findMany();
        return records.map(r => {
            const loc = r.location as any || {};
            return { id: r.id, position: [loc.lat ?? 0, loc.lon ?? 0], type: r.resource_type as ResourceType, amount: r.amount ?? 0 } as ResourceNode;
        });
    }

    // Update resource nodes (bulk upsert)
    async updateResourceNodes(updates: ResourceNode[]): Promise<{ success: boolean; updated: number }> {
        const ops = updates.map(u => {
            const data = {
                created_at: new Date(),
                resource_type: u.type,
                amount: u.amount,
                location: { lat: u.position[0], lon: u.position[1] }
            };
            if (u.id) {
                return prisma.resource_nodes.upsert({ where: { id: u.id }, create: { id: u.id, ...data }, update: data });
            }
            // no id provided - just create a new node and let Postgres generate the id
            return prisma.resource_nodes.create({ data });
        });

        const results = await Promise.all(ops);
        return { success: true, updated: results.length };
    }

    // Get all placed Florbs for a user
    async getPlacedFlorbs(userId: string): Promise<PlacedFlorb[]> {
        const records = await prisma.placed_florbs.findMany({ where: { user_id: userId }, include: { florbs: true } });
        return records.map(r => {
            const loc = r.location as any || {};
            const template: any = r.florbs || {};
            return {
                id: r.id,
                userId: r.user_id || userId,
                florbData: {
                    florbId: template.florb_id || template.id || '',
                    name: template.name || `${template.rarity ? template.rarity : 'Common'} Florb`,
                    baseImagePath: template.base_image_path || '',
                    rarity: template.rarity as any || 'Common',
                    specialEffects: template.special_effects || [],
                    gradientConfig: template.gradient_colors ? { colors: template.gradient_colors, direction: template.gradient_direction, intensity: template.gradient_intensity } : undefined
                },
                position: [loc.lat ?? 0, loc.lon ?? 0],
                placedAt: r.created_at ? new Date(r.created_at) : new Date(),
                gatheringRadius: loc.gatheringRadius ?? 0,
                duration: loc.duration ?? 0,
                effectiveness: loc.effectiveness ?? 0,
                lastGathered: loc.lastGathered ? new Date(loc.lastGathered) : undefined,
                totalGathered: loc.totalGathered
            } as PlacedFlorb;
        });
    }

    // Get count of placed Florbs for a user
    async getPlacedFlorbCount(userId: string): Promise<number> {
        return prisma.placed_florbs.count({ where: { user_id: userId } });
    }

    // Place a new Florb on the map
    async placeFlorb(userId: string, florbData: any, position: [number, number]): Promise<PlacedFlorb> {
        const rarityConfig = RARITY_GATHERING_EFFECTS[florbData.rarity as keyof typeof RARITY_GATHERING_EFFECTS];

        const created = await prisma.placed_florbs.create({
            data: {
                user_id: userId,
                florb_id: florbData.florbId || florbData.id || null,
                created_at: new Date(),
                location: {
                    lat: position[0],
                    lon: position[1],
                    gatheringRadius: rarityConfig?.radius ?? 0,
                    duration: rarityConfig?.durationHours ?? 0,
                    effectiveness: rarityConfig?.throughputMultiplier ?? 0
                }
            }
        });

        const locCreated = created.location as any || {};
        return {
            id: created.id,
            userId: created.user_id || userId,
            florbData: {
                florbId: florbData.florbId || florbData.id || '',
                name: florbData.name || `${florbData.rarity || 'Common'} Florb`,
                baseImagePath: florbData.baseImagePath || florbData.base_image_path || '',
                rarity: florbData.rarity || 'Common',
                specialEffects: florbData.specialEffects || florbData.special_effects || [],
                gradientConfig: florbData.gradientConfig
            },
            position: [locCreated.lat ?? position[0], locCreated.lon ?? position[1]],
            placedAt: created.created_at ? new Date(created.created_at) : new Date(),
            gatheringRadius: locCreated.gatheringRadius ?? (rarityConfig?.radius ?? 0),
            duration: locCreated.duration ?? (rarityConfig?.durationHours ?? 0),
            effectiveness: locCreated.effectiveness ?? (rarityConfig?.throughputMultiplier ?? 0)
        } as PlacedFlorb;
    }

    // Update placed Florbs (bulk)
    async updatePlacedFlorbs(_userId: string, updates: PlacedFlorb[]): Promise<{ success: boolean; updated: number }> {
        const ops = updates.map(u => {
            const data: any = {};
            if (u.position) data.location = { lat: u.position[0], lon: u.position[1], gatheringRadius: u.gatheringRadius, duration: u.duration, effectiveness: u.effectiveness, lastGathered: u.lastGathered, totalGathered: u.totalGathered };
            if (u.florbData) data; // no-op - template data stored in florbs table
            return prisma.placed_florbs.update({ where: { id: u.id! }, data });
        });
        const results = await Promise.all(ops);
        return { success: true, updated: results.length };
    }

    // Get player resources
    async getPlayerResources(userId: string): Promise<PlayerResources> {
        let resources = await prisma.user_resources.findFirst({ where: { user_id: userId } });
        if (!resources) {
            const created = await prisma.user_resources.create({ data: { user_id: userId, crystal: 0, energy: 0, metal: 0, updated_at: new Date() } });
            resources = created as any;
        }
        const res: any = resources;
        return { id: res.id, userId: res.user_id || userId, crystal: res.crystal ?? 0, energy: res.energy ?? 0, metal: res.metal ?? 0, updatedAt: res.updated_at ? new Date(res.updated_at) : undefined } as PlayerResources;
    }

    // Update player resources
    async updatePlayerResources(userId: string, resources: { crystal: number; energy: number; metal: number }): Promise<PlayerResources> {
        const existing = await prisma.user_resources.findFirst({ where: { user_id: userId } });
        if (existing) {
            const updated = await prisma.user_resources.update({ where: { id: existing.id }, data: { crystal: resources.crystal, energy: resources.energy, metal: resources.metal, updated_at: new Date() } });
            return { id: updated.id, userId: updated.user_id || userId, crystal: updated.crystal ?? 0, energy: updated.energy ?? 0, metal: updated.metal ?? 0, updatedAt: updated.updated_at ? new Date(updated.updated_at) : undefined } as PlayerResources;
        } else {
            const created = await prisma.user_resources.create({ data: { user_id: userId, crystal: resources.crystal, energy: resources.energy, metal: resources.metal, updated_at: new Date() } });
            return { id: created.id, userId: created.user_id || userId, crystal: created.crystal ?? 0, energy: created.energy ?? 0, metal: created.metal ?? 0, updatedAt: created.updated_at ? new Date(created.updated_at) : undefined } as PlayerResources;
        }
    }

    // Record gathering analytics — fallback to raw SQL if model/table not present
    async recordGatheringAnalytics(userId: string, gathered: { crystal: number; energy: number; metal: number }, timestamp: string): Promise<void> {
        // Try to use Prisma model if available
        try {
            if ((prisma as any).gathering_analytics) {
                await (prisma as any).gathering_analytics.create({ data: { user_id: userId, gathered, timestamp: new Date(timestamp) } });
                return;
            }
        } catch (e) {
            // fallthrough to raw
        }

        try {
            await prisma.$executeRaw`INSERT INTO gathering_analytics (user_id, gathered, timestamp) VALUES (${userId}, ${JSON.stringify(gathered)}, ${new Date(timestamp)})`;
        } catch (err) {
            // If table doesn't exist or insert fails, log and continue
            console.warn('Could not record gathering analytics (table maybe missing):', err);
        }
    }

    // Export resource data for DB migration
    async exportResourceData(): Promise<ResourceNode[]> {
        return this.getAllResourceNodes();
    }
}