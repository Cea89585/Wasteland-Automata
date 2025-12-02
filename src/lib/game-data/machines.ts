// src/lib/game-data/machines.ts
import type { MachineType, Resource, Item } from '@/lib/game-types';

export interface MachineCost {
    type: MachineType;
    name: string;
    description: string;
    cost: Partial<Record<Resource | Item, number>>;
    unlockedBy: string[]; // Structure IDs or flags
    powerGeneration?: number; // For generators
    powerConsumption?: number; // For consumers
    processingSpeed?: number; // Ticks per item
    recipe?: {
        input?: Partial<Record<Resource | Item, number>>;
        output: Partial<Record<Resource | Item, number>>;
    };
}

export const machineCosts: Record<MachineType, MachineCost> = {
    biomassBurner: {
        type: 'biomassBurner',
        name: 'Biomass Burner',
        description: 'Generates 10 MW of power by burning biomass fuel.',
        cost: {
            scrap: 50,
            components: 20,
            ironPlates: 10,
        },
        unlockedBy: ['generator'],
        powerGeneration: 10,
    },
    miner: {
        type: 'miner',
        name: 'Miner Mk1',
        description: 'Automatically extracts scrap every 10 seconds.',
        cost: {
            scrap: 75,
            components: 30,
            ironPlates: 15,
        },
        unlockedBy: ['generator'],
        powerConsumption: 5,
        processingSpeed: 5, // 5 ticks = 10 seconds
        recipe: {
            output: { scrap: 3 }, // Produces 3 scrap per cycle
        },
    },
    smelter: {
        type: 'smelter',
        name: 'Smelter',
        description: 'Processes scrap into components automatically.',
        cost: {
            scrap: 100,
            components: 50,
            ironPlates: 25,
            ironIngot: 10,
        },
        unlockedBy: ['furnace'],
        powerConsumption: 5,
        processingSpeed: 3, // 3 ticks = 6 seconds
        recipe: {
            input: { scrap: 1 },
            output: { components: 1 },
        },
    },
    constructor: {
        type: 'constructor',
        name: 'Constructor',
        description: 'Crafts items from components automatically.',
        cost: {
            scrap: 150,
            components: 75,
            ironPlates: 40,
            ironIngot: 20,
        },
        unlockedBy: ['furnace'],
        powerConsumption: 5,
        processingSpeed: 5, // 5 ticks = 10 seconds
        recipe: {
            input: { components: 2 },
            output: { ironPlates: 1 }, // Default recipe
        },
    },
};
