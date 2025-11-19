// src/lib/game-data/initial-state.ts
import type { GameState, Statistics, LocationId } from '@/lib/game-types';

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
  silver: 0,
  mutatedTwigs: 0,
  ironIngot: 0,
  biomass: 0,
  stoneAxe: 0,
  metalDetector: 0,
  workbench: 0,
  waterPurifier: 0,
  furnace: 0,
  radio: 0,
  generator: 0,
  droneBay: 0,
  hydroponicsBay: 0,
  miningRig: 0,
  cookedApple: 0,
  crudeMap: 0,
  ironPlates: 0,
  biomassCompressor: 0,
};

export const initialStatistics: Statistics = {
  timesExplored: 0,
  timesScavenged: 0,
  deaths: 0,
  totalItemsGained: {
    ...emptyInventory
  },
};


export const initialState: Omit<GameState, 'statistics'> = {
  characterName: 'Survivor',
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
    silver: 20,
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
  unlockedRecipes: ['recipe_stoneAxe', 'recipe_crudeMap'],
  builtStructures: [],
  unlockedFlags: [],
  unlockedLocations: ['outskirts'],
  unlockedTech: [],
  lockedItems: [],
  completedQuests: [],
  storageLevel: 0,
  energyLevel: 0,
  hungerLevel: 0,
  thirstLevel: 0,
  healthLevel: 0,
  droneLevel: 0,
  isInitialized: false,
  gameTick: 0,
  isResting: false,
  isIdle: false,
  smeltingQueue: 0,
  ironIngotSmeltingQueue: 0,
  droneIsActive: false,
  droneReturnTimestamp: null,
  droneMissionQueue: 0,
  power: 0,
  theme: 'dark',
  lastSavedTimestamp: Date.now(),
};
