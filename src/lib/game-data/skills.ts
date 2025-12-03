// src/lib/game-data/skills.ts

export type SkillCategory = 'crafting' | 'automation' | 'inventory' | 'farming' | 'survival' | 'meta';

export interface Skill {
    id: string;
    name: string;
    description: string;
    category: SkillCategory;
    maxLevel: number;
    cost: number; // Upgrade points per level
    prerequisites?: string[]; // Other skill IDs that must be unlocked first
    requiresStructure?: string; // Structure that must be built
}

export const skillCategories: Record<SkillCategory, { name: string; icon: string }> = {
    crafting: { name: 'Crafting & Production', icon: '🔧' },
    automation: { name: 'Automation & Machines', icon: '⚙️' },
    inventory: { name: 'Inventory & Logistics', icon: '🎒' },
    farming: { name: 'Farming & Resources', icon: '🌾' },
    survival: { name: 'Survival & Efficiency', icon: '🔋' },
    meta: { name: 'Progression & Meta', icon: '🎯' },
};

export const skills: Skill[] = [
    // Crafting & Production
    {
        id: 'bulkCrafter',
        name: 'Bulk Crafter',
        description: 'Unlock "Craft 5" button (Lv1), "Craft 10" button (Lv2), "Craft Max" button (Lv3)',
        category: 'crafting',
        maxLevel: 3,
        cost: 1,
    },
    {
        id: 'efficientHands',
        name: 'Efficient Hands',
        description: 'Reduce manual crafting time by 10% per level',
        category: 'crafting',
        maxLevel: 3,
        cost: 1,
    },
    {
        id: 'resourceIntuition',
        name: 'Resource Intuition',
        description: 'Show exact resource counts in tooltips and highlight craftable recipes',
        category: 'crafting',
        maxLevel: 1,
        cost: 1,
    },

    // Automation & Machines
    {
        id: 'machineEfficiency',
        name: 'Machine Efficiency',
        description: 'Machines process 5% faster per level',
        category: 'automation',
        maxLevel: 3,
        cost: 1,
        requiresStructure: 'generator',
    },
    {
        id: 'largerBuffers',
        name: 'Larger Buffers',
        description: 'Machine buffers hold 15 items (Lv1) or 20 items (Lv2)',
        category: 'automation',
        maxLevel: 2,
        cost: 1,
        requiresStructure: 'generator',
    },
    {
        id: 'powerSaver',
        name: 'Power Saver',
        description: 'Machines consume 20% less power',
        category: 'automation',
        maxLevel: 1,
        cost: 1,
        requiresStructure: 'generator',
    },

    // Inventory & Logistics
    {
        id: 'packMule',
        name: 'Pack Mule',
        description: '+25 base inventory capacity per level',
        category: 'inventory',
        maxLevel: 3,
        cost: 1,
    },
    {
        id: 'quickHands',
        name: 'Quick Hands',
        description: 'Transfer items to/from machines in stacks of 5 instead of 1',
        category: 'inventory',
        maxLevel: 1,
        cost: 1,
        requiresStructure: 'generator',
    },

    // Farming & Resources
    {
        id: 'greenThumb',
        name: 'Green Thumb',
        description: 'Crops grow 15% faster per level',
        category: 'farming',
        maxLevel: 3,
        cost: 1,
        requiresStructure: 'hydroponicsBay',
    },
    {
        id: 'bountifulHarvest',
        name: 'Bountiful Harvest',
        description: '+1 minimum yield from harvesting crops',
        category: 'farming',
        maxLevel: 2,
        cost: 1,
        requiresStructure: 'hydroponicsBay',
    },
    {
        id: 'seedSaver',
        name: 'Seed Saver',
        description: '25% chance to get seeds back when harvesting',
        category: 'farming',
        maxLevel: 1,
        cost: 1,
        requiresStructure: 'hydroponicsBay',
    },

    // Survival & Efficiency
    {
        id: 'efficientMetabolism',
        name: 'Efficient Metabolism',
        description: 'Hunger/Thirst drain 10% slower per level',
        category: 'survival',
        maxLevel: 3,
        cost: 1,
    },
    {
        id: 'secondWind',
        name: 'Second Wind',
        description: 'Resting restores 50% more health',
        category: 'survival',
        maxLevel: 2,
        cost: 1,
    },
    {
        id: 'scavengersEye',
        name: "Scavenger's Eye",
        description: '10% more resources from exploration/scavenging',
        category: 'survival',
        maxLevel: 1,
        cost: 1,
    },

    // Progression & Meta
    {
        id: 'fastLearner',
        name: 'Fast Learner',
        description: 'Gain 5% more XP per level from all sources',
        category: 'meta',
        maxLevel: 3,
        cost: 1,
    },
    {
        id: 'silverTongue',
        name: 'Silver Tongue',
        description: 'Sell items for 10% more silver',
        category: 'meta',
        maxLevel: 1,
        cost: 1,
        requiresStructure: 'workbench',
    },
    {
        id: 'masteryAdept',
        name: 'Mastery Adept',
        description: 'Mastery milestones give 25% more rewards',
        category: 'meta',
        maxLevel: 2,
        cost: 1,
    },
];

// Helper function to get skill level
export const getSkillLevel = (skills: Record<string, number>, skillId: string): number => {
    return skills[skillId] || 0;
};

// Helper function to check if skill can be unlocked
export const canUnlockSkill = (
    playerSkills: Record<string, number>,
    skillId: string,
    upgradePoints: number,
    builtStructures: string[]
): { canUnlock: boolean; reason?: string } => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return { canUnlock: false, reason: 'Skill not found' };

    const currentLevel = getSkillLevel(playerSkills, skillId);
    if (currentLevel >= skill.maxLevel) {
        return { canUnlock: false, reason: 'Max level reached' };
    }

    if (upgradePoints < skill.cost) {
        return { canUnlock: false, reason: 'Not enough upgrade points' };
    }

    if (skill.prerequisites) {
        for (const prereqId of skill.prerequisites) {
            if (!getSkillLevel(playerSkills, prereqId)) {
                return { canUnlock: false, reason: 'Missing prerequisites' };
            }
        }
    }

    if (skill.requiresStructure && !builtStructures.includes(skill.requiresStructure)) {
        return { canUnlock: false, reason: `Requires ${skill.requiresStructure}` };
    }

    return { canUnlock: true };
};
