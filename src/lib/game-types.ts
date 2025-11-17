// src/lib/game-types.ts

import type { FixedEncounter } from "./game-data/encounters";

export const Resources = {
  wood: 'Wood',
  stone: 'Stone',
  scrap: 'Scrap Metal',
  apple: 'Apple',
  water: 'Water',
  components: 'Components',
  uranium: 'Uranium',
  lemon: 'Lemon',
  banana: 'Banana',
  peach: 'Peach',
  silver: 'Silver'
} as const;
export type Resource = keyof typeof Resources;

export const Items = {
  stoneAxe: 'Stone Axe',
  metalDetector: 'Metal Detector',
  workbench: 'Workbench',
  waterPurifier: 'Water Purifier',
  furnace: 'Furnace',
  radio: 'Radio Tower',
  generator: 'Power Generator',
  droneBay: 'Drone Bay',
  miningRig: 'Mining Rig',
  cookedApple: 'Cooked Apple',
} as const;
export type Item = keyof typeof Items;

export type Inventory = Record<Resource | Item, number>;

export interface PlayerStats {
  health: number;
  hunger: number;
  thirst: number;
  energy: number;
}

export type Statistics = {
    timesExplored: number;
    timesScavenged: number;
    deaths: number;
    totalItemsGained: Partial<Record<Resource | Item, number>>;
}

export type LogMessage = {
  id: number;
  text: string;
  timestamp: number;
  type: 'info' | 'event' | 'danger' | 'success' | 'craft';
  item?: Resource | Item;
};

export type LocationId =
  | 'outskirts'
  | 'forest'
  | 'tunnels'
  | 'wasteland'
  | 'bunker'
  | 'industrial';

export type TechId = 'basicTools' | 'shelter' | 'power' | 'automation';

export type EquipmentSlot = 'hand' | 'body';
export type Equipment = Partial<Record<EquipmentSlot, Item | null>>;

export interface GameState {
  playerStats: PlayerStats;
  inventory: Inventory;
  equipment: Equipment;
  statistics: Statistics;
  log: LogMessage[];
  currentLocation: LocationId;
  unlockedRecipes: string[];
  builtStructures: string[];
  unlockedTech: TechId[];
  lockedItems: Resource[];
  isInitialized: boolean;
  gameTick: number;
  isResting: boolean;
  smeltingQueue: number;
}

export type GameAction =
  | { type: 'INITIALIZE'; payload: { gameState: Omit<GameState, 'statistics'>, statistics: Statistics } }
  | { type: 'RESET_GAME' }
  | { type: 'GAME_TICK' }
  | { type: 'TRACK_STAT'; payload: { stat: keyof Pick<Statistics, 'timesExplored' | 'timesScavenged'> } }
  | { type: 'ADD_LOG'; payload: { text: string; type: LogMessage['type'], item?: Resource | Item } }
  | { type: 'CLEAR_LOG' }
  | { type: 'TRIGGER_ENCOUNTER'; payload: FixedEncounter }
  | { type: 'GATHER'; payload: { resource: Resource; amount: number } }
  | { type: 'CRAFT'; payload: { recipeId: string } }
  | { type: 'BUILD_STRUCTURE'; payload: { recipeId: string } }
  | { type: 'SELL_ITEM'; payload: { item: Resource, amount: number, price: number } }
  | { type: 'SELL_ALL_UNLOCKED' }
  | { type: 'TOGGLE_LOCK_ITEM'; payload: { item: Resource } }
  | { type: 'CONSUME'; payload: { stat: keyof PlayerStats, resource?: Resource, amount: number } }
  | { type: 'PENALTY'; payload: { stat: keyof PlayerStats; percentage: number } }
  | { type: 'REGEN_ENERGY'; payload: { amount: number } }
  | { type: 'EAT' }
  | { type: 'DRINK' }
  | { type: 'EAT_COOKED_APPLE' }
  | { type: 'START_RESTING' }
  | { type: 'FINISH_RESTING' }
  | { type: 'START_SMELTING'; payload: { amount: number } }
  | { type: 'FINISH_SMELTING' }
  | { type: 'EQUIP'; payload: { item: Item, slot: EquipmentSlot } }
  | { type: 'UNEQUIP'; payload: { slot: EquipmentSlot } };
