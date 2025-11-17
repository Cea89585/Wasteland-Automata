// src/lib/game-data/recipes.ts
import type { Resource, Item } from '@/lib/game-types';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  creates: Item;
  requirements: Partial<Record<Resource, number>>;
  unlockedBy: string[]; // Can be item IDs (e.g., 'workbench') or tech IDs
}

export const recipes: Recipe[] = [
  {
    id: 'recipe_stoneAxe',
    name: 'Craft Stone Axe',
    description: 'A basic tool for gathering wood.',
    creates: 'stoneAxe',
    requirements: { wood: 5, stone: 10 },
    unlockedBy: ['start'],
  },
  {
    id: 'recipe_workbench',
    name: 'Build Workbench',
    description: 'A station for advanced crafting.',
    creates: 'workbench',
    requirements: { wood: 20, stone: 10, scrap: 5 },
    unlockedBy: ['start'],
  },
  {
    id: 'recipe_waterPurifier',
    name: 'Build Water Purifier',
    description: 'Passively generates clean water.',
    creates: 'waterPurifier',
    requirements: { scrap: 15, components: 2 },
    unlockedBy: ['workbench'],
  },
  {
    id: 'recipe_furnace',
    name: 'Build Furnace',
    description: 'Smelts scrap into components.',
    creates: 'furnace',
    requirements: { stone: 50, scrap: 10 },
    unlockedBy: ['workbench'],
  },
];
