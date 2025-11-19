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
    id: 'recipe_metalDetector',
    name: 'Craft Metal Detector',
    description: 'A crude device to find scrap metal.',
    creates: 'metalDetector',
    requirements: { scrap: 15, components: 5 },
    unlockedBy: ['workbench'],
  },
  {
    id: 'recipe_workbench',
    name: 'Workbench',
    description: 'A station for advanced crafting.',
    creates: 'workbench',
    requirements: { wood: 20, stone: 10, scrap: 5 },
    unlockedBy: [], // No longer unlocked at start
  },
  {
    id: 'recipe_crudeMap',
    name: 'Craft Crude Map',
    description: 'Piece together scraps of information to map a path to a new location.',
    creates: 'crudeMap',
    requirements: { wood: 10, scrap: 5 },
    unlockedBy: ['start'],
  },
  {
    id: 'recipe_cookedApple',
    name: 'Cooked Apple',
    description: 'Cook an apple with water to make it more restorative.',
    creates: 'cookedApple',
    requirements: { apple: 25, water: 10 },
    unlockedBy: ['workbench'],
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
    description: 'A structure to smelt scrap into more useful components.',
    creates: 'furnace',
    requirements: { stone: 50, scrap: 10 },
    unlockedBy: ['workbench'],
  },
  {
    id: 'recipe_droneBay',
    name: 'Build Drone Bay',
    description: 'Construct a bay to house and operate a scavenger drone.',
    creates: 'droneBay',
    requirements: { scrap: 25, components: 10 },
    unlockedBy: ['workbench'],
  },
  {
    id: 'recipe_hydroponicsBay',
    name: 'Build Hydroponics Bay',
    description: 'An automated bay that grows edible plants.',
    creates: 'hydroponicsBay',
    requirements: { scrap: 30, components: 15, water: 20 },
    unlockedBy: ['workbench'],
  }
];
