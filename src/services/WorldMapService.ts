import { Collection } from 'mongodb';
import { connectToDatabase } from '../db/connection.js';
import {
    ResourceNode,
    ResourceNodeInput,
    PlacedFlorb,
    PlacedFlorbInput,
    PlayerResources,
    PlayerResourcesInput,
    RESOURCE_TYPES,
    RARITY_GATHERING_EFFECTS,
    ResourceType,
    GatheringAnalytics
} from '../types/Florb.js';

export class WorldMapService {
    private resourceCollection: Collection<ResourceNode> | null = null;
    private placedFlorbCollection: Collection<PlacedFlorb> | null = null;
    private playerResourcesCollection: Collection<PlayerResources> | null = null;
    private analyticsCollection: Collection<GatheringAnalytics> | null = null;

    constructor() {
        // Removed florbService as it's not needed for the new API spec
    }

    private async getResourceCollection(): Promise<Collection<ResourceNode>> {
        if (!this.resourceCollection) {
            const db = await connectToDatabase();
            this.resourceCollection = db.collection<ResourceNode>('resourceNodes');
        }
        return this.resourceCollection;
    }

    private async getPlacedFlorbCollection(): Promise<Collection<PlacedFlorb>> {
        if (!this.placedFlorbCollection) {
            const db = await connectToDatabase();
            this.placedFlorbCollection = db.collection<PlacedFlorb>('placedFlorbs');
        }
        return this.placedFlorbCollection;
    }

    private async getPlayerResourcesCollection(): Promise<Collection<PlayerResources>> {
        if (!this.playerResourcesCollection) {
            const db = await connectToDatabase();
            this.playerResourcesCollection = db.collection<PlayerResources>('playerResources');
        }
        return this.playerResourcesCollection;
    }

    private async getAnalyticsCollection(): Promise<Collection<GatheringAnalytics>> {
        if (!this.analyticsCollection) {
            const db = await connectToDatabase();
            this.analyticsCollection = db.collection<GatheringAnalytics>('gatheringAnalytics');
        }
        return this.analyticsCollection;
    }

    // Generate random resource nodes across the world
    async generateResourceNodes(count: number = 100): Promise<ResourceNode[]> {
        const collection = await this.getResourceCollection();
        const nodes: ResourceNode[] = [];

        for (let i = 0; i < count; i++) {
            const node: ResourceNodeInput = {
                id: `resource_${Date.now()}_${i}`,
                position: [
                    (Math.random() - 0.5) * 180, // latitude: -90 to 90
                    (Math.random() - 0.5) * 360  // longitude: -180 to 180
                ] as [number, number],
                type: RESOURCE_TYPES[Math.floor(Math.random() * RESOURCE_TYPES.length)] as ResourceType,
                amount: Math.floor(Math.random() * 1000) + 1, // 1-1000
            };

            const result = await collection.insertOne(node);
            nodes.push({ ...node, _id: result.insertedId });
        }

        return nodes;
    }

    // Get all resource nodes
    async getAllResourceNodes(): Promise<ResourceNode[]> {
        const collection = await this.getResourceCollection();
        return await collection.find({}).toArray();
    }

    // Update resource nodes (bulk)
    async updateResourceNodes(updates: ResourceNode[]): Promise<{ success: boolean; updated: number }> {
        const collection = await this.getResourceCollection();

        const bulkOps = updates.map(update => ({
            updateOne: {
                filter: { id: update.id },
                update: { $set: update }
            }
        }));

        const result = await collection.bulkWrite(bulkOps);
        return { success: true, updated: result.modifiedCount };
    }

    // Get all placed Florbs for a user
    async getPlacedFlorbs(userId: string): Promise<PlacedFlorb[]> {
        const collection = await this.getPlacedFlorbCollection();
        return await collection.find({ userId }).toArray();
    }

    // Get count of placed Florbs for a user
    async getPlacedFlorbCount(userId: string): Promise<number> {
        const collection = await this.getPlacedFlorbCollection();
        return await collection.countDocuments({ userId });
    }

    // Place a new Florb on the map
    async placeFlorb(userId: string, florbData: any, position: [number, number]): Promise<PlacedFlorb> {
        const collection = await this.getPlacedFlorbCollection();

        // Get rarity config for gathering stats
        const rarityConfig = RARITY_GATHERING_EFFECTS[florbData.rarity as keyof typeof RARITY_GATHERING_EFFECTS];

        const placedFlorb: PlacedFlorbInput = {
            id: `placed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            florbData,
            position,
            placedAt: new Date().toISOString(),
            gatheringRadius: rarityConfig.radius,
            duration: rarityConfig.durationHours,
            effectiveness: rarityConfig.throughputMultiplier,
        };

        const result = await collection.insertOne(placedFlorb);
        return { ...placedFlorb, _id: result.insertedId };
    }

    // Update placed Florbs (bulk)
    async updatePlacedFlorbs(userId: string, updates: PlacedFlorb[]): Promise<{ success: boolean; updated: number }> {
        const collection = await this.getPlacedFlorbCollection();

        const bulkOps = updates.map(update => {
            // Exclude _id from the update operation since it's immutable
            const { _id, ...updateData } = update;
            return {
                updateOne: {
                    filter: { id: update.id, userId },
                    update: { $set: updateData }
                }
            };
        });

        const result = await collection.bulkWrite(bulkOps);
        return { success: true, updated: result.modifiedCount };
    }

    // Get player resources
    async getPlayerResources(userId: string): Promise<PlayerResources> {
        const collection = await this.getPlayerResourcesCollection();
        let resources = await collection.findOne({ userId });

        if (!resources) {
            // Create default resources if they don't exist
            const defaultResources: PlayerResourcesInput = {
                userId,
                crystal: 0,
                energy: 0,
                metal: 0,
                updatedAt: new Date()
            };
            const result = await collection.insertOne(defaultResources);
            resources = { ...defaultResources, _id: result.insertedId };
        }

        return resources as PlayerResources;
    }

    // Update player resources
    async updatePlayerResources(userId: string, resources: { crystal: number; energy: number; metal: number }): Promise<PlayerResources> {
        const collection = await this.getPlayerResourcesCollection();

        const updateData = {
            ...resources,
            updatedAt: new Date()
        };

        await collection.updateOne(
            { userId },
            { $set: updateData },
            { upsert: true }
        );

        return await this.getPlayerResources(userId);
    }

    // Record gathering analytics
    async recordGatheringAnalytics(userId: string, gathered: { crystal: number; energy: number; metal: number }, timestamp: string): Promise<void> {
        const collection = await this.getAnalyticsCollection();

        await collection.insertOne({
            userId,
            gathered,
            timestamp
        });
    }

    // Export resource data for DB migration
    async exportResourceData(): Promise<ResourceNode[]> {
        return await this.getAllResourceNodes();
    }
}