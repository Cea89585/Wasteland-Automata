// src/lib/game-data/initial-state.ts
import type { GameState } from '@/lib/game-types';

const emptyInventory = {
  wood: 0,
  stone: 0,
  scrap: 0,
  apple: 0,
  water: 0,
  components: 0,
  uranium: 0,
  lemon: 0,
  banana: 0,
  peach: 0,
  stoneAxe: 0,
  workbench: 0,
  waterPurifier: 0,
  furnace: 0,
  radio: 0,
  generator: 0,
  droneBay: 0,
  miningRig: 0,
  cookedApple: 0,
};

export const initialState: GameState = {
  playerStats: {
    health: 100,
    hunger: 100,
    thirst: 100,
    energy: 100,
  },
  inventory: {
    ...emptyInventory,
    apple: 5,
    water: 5,
  },
  equipment: {
    hand: null,
    body: null,
  },
  log: [
    {
      id: 1,
      text: 'You awaken to the grey light of a sunless sky. The world you knew is gone, replaced by ruins and silence.',
      timestamp: Date.now(),
      type: 'event',
    },
    {
      id: 2,
      text: 'Survival is your only goal. Find resources, craft tools, and endure.',
      timestamp: Date.now() + 1,
      type: 'info',
    },
  ],
  currentLocation: 'outskirts',
  unlockedRecipes: ['recipe_stoneAxe'],
  builtStructures: [],
  unlockedTech: [],
  isInitialized: false,
  gameTick: 0,
  isResting: false,
};
