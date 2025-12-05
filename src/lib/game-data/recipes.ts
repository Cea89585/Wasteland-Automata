// src/lib/game-data/recipes.ts
import type { Resource, Item } from '@/lib/game-types';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  creates: Item | Resource;
  outputAmount?: number;
  requirements: Partial<Record<Resource | Item, number>>;
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
    requirements: { wood: 25, scrap: 10, silver: 50 },
    unlockedBy: ['workbench'],
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
    requirements: { scrap: 25, components: 10, ironPlates: 5 },
    unlockedBy: ['generator'],
  },
  {
    id: 'recipe_generator',
    name: 'Build Power Generator',
    description: 'A power source for your automated systems.',
    creates: 'generator',
    requirements: { scrap: 50, components: 15, ironPlates: 10 },
    unlockedBy: ['furnace'],
  },
  {
    id: 'recipe_hydroponicsBay',
    name: 'Build Hydroponics Bay',
    description: 'An automated bay that grows edible plants.',
    creates: 'hydroponicsBay',
    requirements: { scrap: 30, components: 15, water: 20 },
    unlockedBy: ['workbench'],
  },
  {
    id: 'recipe_ironPlates',
    name: 'Craft Iron Plates',
    description: 'Forge iron ingots into durable plates.',
    creates: 'ironPlates',
    requirements: { ironIngot: 5, components: 1 },
    unlockedBy: ['furnace'],
  },
  {
    id: 'recipe_biomassCompressor',
    name: 'Biomass Compressor',
    description: 'A machine to compress organic matter. Unlocks biomass crafting.',
    creates: 'biomassCompressor',
    requirements: { scrap: 75, components: 20, ironIngot: 10 },
    unlockedBy: ['furnace'],
  },
  {
    id: 'recipe_createBiomass',
    name: 'Create Biomass',
    description: 'Compresses organic material into a dense, energy-rich block.',
    creates: 'biomass',
    requirements: { mutatedTwigs: 150, wood: 100 },
    unlockedBy: ['biomassCompressor'],
  },
  {
    id: 'recipe_appleSeeds',
    name: 'Extract Apple Seeds',
    description: 'Carefully extract seeds from an apple for planting.',
    creates: 'appleSeeds',
    requirements: { apple: 1 },
    unlockedBy: ['hydroponicsBay'],
  },
  {
    id: 'recipe_pickaxe',
    name: 'Craft Pickaxe',
    description: 'A sturdy tool for breaking rocks and finding ore.',
    creates: 'pickaxe',
    requirements: { ironIngot: 2, wood: 1 },
    unlockedBy: ['workbench'],
  },
  {
    id: 'recipe_grindStone',
    name: 'Craft Sand',
    description: 'Crush stone into fine sand.',
    creates: 'sand',
    outputAmount: 5,
    requirements: { stone: 1 },
    unlockedBy: [],
  },
  {
    id: 'recipe_pickledPeaches',
    name: 'Pickle Peaches',
    description: 'Preserve peaches in a glass jar to create a valuable trade good.',
    creates: 'pickledPeaches',
    requirements: { peach: 5, glassJar: 1 },
    unlockedBy: ['workbench'],
  },
  {
    id: 'recipe_glassTube',
    name: 'Smelt Glass Tube',
    description: 'Melt sand into a glass tube.',
    creates: 'glassTube',
    requirements: { sand: 5 },
    unlockedBy: ['furnace'],
  },
  {
    id: 'recipe_glassJar',
    name: 'Craft Glass Jar',
    description: 'Combine glass tubes to make a jar.',
    creates: 'glassJar',
    requirements: { glassTube: 2 },
    unlockedBy: ['workbench'],
  },
  // Machine recipes - Note: These don't create items, they're handled specially in BUILD_MACHINE action
  // Keeping them here for consistency and future UI integration
];
