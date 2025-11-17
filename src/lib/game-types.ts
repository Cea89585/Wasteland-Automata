// src/lib/game-types.ts

export const Resources = {
  wood: 'Wood',
  stone: 'Stone',
  scrap: 'Scrap Metal',
  food: 'Food',
  water: 'Water',
  components: 'Components',
  uranium: 'Uranium',
} as const;
export type Resource = keyof typeof Resources;

export const Items = {
  stoneAxe: 'Stone Axe',
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

export type LogMessage = {
  id: number;
  text: string;
  timestamp: number;
  type: 'info' | 'event' | 'danger' | 'success' | 'craft';
};

export type LocationId =
  | 'outskirts'
  | 'forest'
  | 'tunnels'
  | 'wasteland'
  | 'bunker'
  | 'industrial';

export type TechId = 'basicTools' | 'shelter' | 'power' | 'automation';

export interface GameState {
  playerStats: PlayerStats;
  inventory: Inventory;
  log: LogMessage[];
  currentLocation: LocationId;
  unlockedRecipes: string[];
  builtStructures: string[];
  unlockedTech: TechId[];
  isInitialized: boolean;
  gameTick: number;
}

export type GameAction =
  | { type: 'INITIALIZE'; payload: GameState }
  | { type: 'GAME_TICK' }
  | { type: 'ADD_LOG'; payload: { text: string; type: LogMessage['type'] } }
  | { type: 'GATHER'; payload: { resource: Resource; amount: number } }
  | { type: 'CRAFT'; payload: { recipeId: string } }
  | { type: 'CONSUME'; payload: { stat: keyof PlayerStats; amount: number } }
  | { type: 'REGEN_ENERGY'; payload: { amount: number } }
  | { type: 'EAT' }
  | { type: 'DRINK' }
  | { type: 'EAT_COOKED_APPLE' };
