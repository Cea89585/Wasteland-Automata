// src/lib/game-data/fishing.ts
import type { Resource, Item } from '../game-types';

export type FishingRarity = 'veryCommon' | 'common' | 'uncommon' | 'rare' | 'veryRare' | 'superRare';

export interface FishingLoot {
    item: Resource | Item | string; // string for fish types
    rarity: FishingRarity;
    weight: number; // Probability weight
    silverValue?: number; // If it's a fish that can be sold
    isFish?: boolean; // True if this is a sellable fish
}

export interface FishingZone {
    id: string;
    name: string;
    description: string;
    levelRequirement: number;
    energyCost: number;
    lootTable: FishingLoot[];
}

// Rarity weights for drop calculation
export const rarityWeights: Record<FishingRarity, number> = {
    veryCommon: 100,
    common: 50,
    uncommon: 20,
    rare: 5,
    veryRare: 1,
    superRare: 0.1,
};

export const fishingZones: FishingZone[] = [
    {
        id: 'toxic_puddle',
        name: 'Toxic Puddle',
        description: 'A small, irradiated pool near the outskirts. The water glows faintly green.',
        levelRequirement: 1,
        energyCost: 5,
        lootTable: [
            { item: 'mutantMinnow', rarity: 'veryCommon', weight: 100, silverValue: 5, isFish: true },
            { item: 'rustyCan', rarity: 'veryCommon', weight: 100, silverValue: 2, isFish: true },
            { item: 'radPerch', rarity: 'common', weight: 50, silverValue: 10, isFish: true },
            { item: 'scrap', rarity: 'common', weight: 50 },
            { item: 'glowingAlgae', rarity: 'uncommon', weight: 20, silverValue: 15, isFish: true },
            { item: 'silver', rarity: 'rare', weight: 5 },
            { item: 'goldenMinnow', rarity: 'veryRare', weight: 1, silverValue: 100, isFish: true },
        ],
    },
    {
        id: 'contaminated_creek',
        name: 'Contaminated Creek',
        description: 'A slow-moving stream through the forest zone. Strange fish swim in murky waters.',
        levelRequirement: 5,
        energyCost: 8,
        lootTable: [
            { item: 'sludgeBass', rarity: 'veryCommon', weight: 100, silverValue: 15, isFish: true },
            { item: 'mutantMinnow', rarity: 'veryCommon', weight: 100, silverValue: 5, isFish: true },
            { item: 'radPerch', rarity: 'common', weight: 50, silverValue: 10, isFish: true },
            { item: 'irradiatedCarp', rarity: 'common', weight: 50, silverValue: 12, isFish: true },
            { item: 'scrap', rarity: 'common', weight: 50 },
            { item: 'bioLuminescentMoss', rarity: 'uncommon', weight: 20, silverValue: 20, isFish: true },
            { item: 'oldBoot', rarity: 'uncommon', weight: 20, silverValue: 3, isFish: true },
            { item: 'silver', rarity: 'rare', weight: 5 },
            { item: 'components', rarity: 'rare', weight: 5 },
            { item: 'goldenBass', rarity: 'veryRare', weight: 1, silverValue: 200, isFish: true },
        ],
    },
    {
        id: 'reactor_pond',
        name: 'Reactor Pond',
        description: 'A glowing pool near the old power station. The water pulses with eerie light.',
        levelRequirement: 10,
        energyCost: 10,
        lootTable: [
            { item: 'glowfish', rarity: 'veryCommon', weight: 100, silverValue: 20, isFish: true },
            { item: 'sludgeBass', rarity: 'veryCommon', weight: 100, silverValue: 15, isFish: true },
            { item: 'radPerch', rarity: 'common', weight: 50, silverValue: 10, isFish: true },
            { item: 'mutantCatfish', rarity: 'common', weight: 50, silverValue: 25, isFish: true },
            { item: 'uranium', rarity: 'uncommon', weight: 20 },
            { item: 'reactorCoreShard', rarity: 'uncommon', weight: 20, silverValue: 30, isFish: true },
            { item: 'silver', rarity: 'rare', weight: 5 },
            { item: 'components', rarity: 'rare', weight: 5 },
            { item: 'goldenGlowfish', rarity: 'veryRare', weight: 1, silverValue: 300, isFish: true },
            { item: 'components', rarity: 'veryRare', weight: 1 },
        ],
    },
    {
        id: 'flooded_bunker',
        name: 'Flooded Bunker',
        description: 'A submerged military installation. Dark waters hide pre-war secrets.',
        levelRequirement: 20,
        energyCost: 12,
        lootTable: [
            { item: 'bunkerCarp', rarity: 'veryCommon', weight: 100, silverValue: 25, isFish: true },
            { item: 'caveEel', rarity: 'veryCommon', weight: 100, silverValue: 28, isFish: true },
            { item: 'armoredFish', rarity: 'common', weight: 50, silverValue: 30, isFish: true },
            { item: 'scrap', rarity: 'common', weight: 50 },
            { item: 'militaryRation', rarity: 'uncommon', weight: 20, silverValue: 40, isFish: true },
            { item: 'waterloggedDataChip', rarity: 'uncommon', weight: 20, silverValue: 35, isFish: true },
            { item: 'ironIngot', rarity: 'rare', weight: 5 },
            { item: 'components', rarity: 'rare', weight: 5 },
            { item: 'goldenEel', rarity: 'veryRare', weight: 1, silverValue: 400, isFish: true },
            { item: 'preWarTech', rarity: 'veryRare', weight: 1, silverValue: 150, isFish: true },
        ],
    },
    {
        id: 'chemical_lake',
        name: 'Chemical Lake',
        description: 'A large lake with strange chemical properties. The fish here have adapted in bizarre ways.',
        levelRequirement: 30,
        energyCost: 15,
        lootTable: [
            { item: 'acidSwimmer', rarity: 'veryCommon', weight: 100, silverValue: 35, isFish: true },
            { item: 'toxicTrout', rarity: 'veryCommon', weight: 100, silverValue: 32, isFish: true },
            { item: 'chemicalCarp', rarity: 'common', weight: 50, silverValue: 38, isFish: true },
            { item: 'mutantCatfish', rarity: 'common', weight: 50, silverValue: 25, isFish: true },
            { item: 'strangeCrystal', rarity: 'uncommon', weight: 20, silverValue: 50, isFish: true },
            { item: 'biomass', rarity: 'uncommon', weight: 20 },
            { item: 'components', rarity: 'rare', weight: 5 },
            { item: 'chemicalSample', rarity: 'rare', weight: 5, silverValue: 60, isFish: true },
            { item: 'goldenSwimmer', rarity: 'veryRare', weight: 1, silverValue: 500, isFish: true },
            { item: 'experimentalCompound', rarity: 'veryRare', weight: 1, silverValue: 200, isFish: true },
        ],
    },
    {
        id: 'deep_crater',
        name: 'Deep Crater',
        description: 'An impact crater filled with mysterious water. Something ancient stirs in the depths.',
        levelRequirement: 40,
        energyCost: 18,
        lootTable: [
            { item: 'craterDweller', rarity: 'veryCommon', weight: 100, silverValue: 40, isFish: true },
            { item: 'depthFish', rarity: 'veryCommon', weight: 100, silverValue: 42, isFish: true },
            { item: 'meteorFragment', rarity: 'common', weight: 50, silverValue: 55, isFish: true },
            { item: 'irradiatedCarp', rarity: 'common', weight: 50, silverValue: 12, isFish: true },
            { item: 'cosmicDebris', rarity: 'uncommon', weight: 20, silverValue: 70, isFish: true },
            { item: 'charcoal', rarity: 'uncommon', weight: 20 },
            { item: 'ironIngot', rarity: 'rare', weight: 5 },
            { item: 'ironPlates', rarity: 'rare', weight: 5 },
            { item: 'goldenCraterFish', rarity: 'veryRare', weight: 1, silverValue: 600, isFish: true },
            { item: 'meteoriteShard', rarity: 'veryRare', weight: 1, silverValue: 250, isFish: true },
            { item: 'ancientArtifact', rarity: 'superRare', weight: 0.1, silverValue: 500, isFish: true },
        ],
    },
    {
        id: 'sunken_city',
        name: 'Sunken City',
        description: 'Ruins of a pre-war city, now underwater. Treasures and dangers lurk in equal measure.',
        levelRequirement: 50,
        energyCost: 20,
        lootTable: [
            { item: 'urbanScavengerFish', rarity: 'veryCommon', weight: 100, silverValue: 50, isFish: true },
            { item: 'rubbleSwimmer', rarity: 'veryCommon', weight: 100, silverValue: 48, isFish: true },
            { item: 'buildingMaterial', rarity: 'common', weight: 50, silverValue: 25, isFish: true },
            { item: 'scrap', rarity: 'common', weight: 50 },
            { item: 'preWarCurrency', rarity: 'uncommon', weight: 20, silverValue: 80, isFish: true },
            { item: 'glassShard', rarity: 'uncommon', weight: 20, silverValue: 30, isFish: true },
            { item: 'components', rarity: 'rare', weight: 5 },
            { item: 'ironIngot', rarity: 'rare', weight: 5 },
            { item: 'goldenCityFish', rarity: 'veryRare', weight: 1, silverValue: 800, isFish: true },
            { item: 'pristinePreWarItem', rarity: 'veryRare', weight: 1, silverValue: 300, isFish: true },
            { item: 'treasureCache', rarity: 'superRare', weight: 0.1, silverValue: 1000, isFish: true },
        ],
    },
];

// Helper function to get fishing zone by ID
export const getFishingZoneById = (id: string): FishingZone | undefined => {
    return fishingZones.find(zone => zone.id === id);
};

// Helper function to get available zones for player level
export const getAvailableFishingZones = (playerLevel: number): FishingZone[] => {
    return fishingZones.filter(zone => zone.levelRequirement <= playerLevel);
};

// Weighted random selection from loot table
export const rollFishingLoot = (lootTable: FishingLoot[], hasLuck: boolean = false): FishingLoot => {
    const performRoll = () => {
        const totalWeight = lootTable.reduce((sum, loot) => sum + loot.weight, 0);
        let random = Math.random() * totalWeight;

        for (const loot of lootTable) {
            random -= loot.weight;
            if (random <= 0) {
                return loot;
            }
        }
        return lootTable[0];
    };

    const result1 = performRoll();
    if (!hasLuck) return result1;

    // With luck, if result is common, try to get something better
    if (result1.rarity === 'common' || result1.rarity === 'veryCommon') {
        const result2 = performRoll();
        // Lower weight value means rarer item (defined in rarityWeights)
        if (rarityWeights[result2.rarity] < rarityWeights[result1.rarity]) {
            return result2;
        }
    }

    return result1;
};
