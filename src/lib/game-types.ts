// src/lib/game-types.ts

import type { FixedEncounter } from "./game-data/encounters";
import type { Quest, QuestRequirement } from "./game-data/quests";

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
  hydroponicsBay: 'Hydroponics Bay',
  miningRig: 'Mining Rig',
  cookedApple: 'Cooked Apple',
  crudeMap: 'Crude Map',
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

export const locationOrder: LocationId[] = ['outskirts', 'forest', 'tunnels', 'industrial', 'wasteland', 'bunker'];


export type TechId = 'basicTools' | 'shelter' | 'power' | 'automation';
export type Flag = 'mapCrafted';


export type EquipmentSlot = 'hand' | 'body';
export type Equipment = Partial<Record<EquipmentSlot, Item | null>>;

export type Theme = 'light' | 'dark' | 'system';

export interface GameState {
  playerStats: PlayerStats;
  inventory: Inventory;
  equipment: Equipment;
  statistics: Statistics;
  log: LogMessage[];
  currentLocation: LocationId;
  unlockedRecipes: string[];
  builtStructures: string[];
  unlockedFlags: Flag[];
  unlockedLocations: LocationId[];
  unlockedTech: TechId[];
  lockedItems: Resource[];
  completedQuests: string[];
  storageLevel: number;
  energyLevel: number;
  hungerLevel: number;
  thirstLevel: number;
  healthLevel: number;
  droneLevel: number;
  isInitialized: boolean;
  gameTick: number;
  isResting: boolean;
  isIdle: boolean;
  smeltingQueue: number;
  droneIsActive: boolean;
  droneReturnTimestamp: number | null;
  theme: Theme;
}

export type GameAction =
  | { type: 'INITIALIZE'; payload: { gameState: Omit<GameState, 'statistics'>, statistics: Statistics } }
  | { type: 'RESET_GAME' }
  | { type: 'GAME_TICK' }
  | { type: 'SET_IDLE', payload: boolean }
  | { type: 'TRACK_STAT'; payload: { stat: keyof Pick<Statistics, 'timesExplored' | 'timesScavenged'> } }
  | { type: 'ADD_LOG'; payload: { text: string; type: LogMessage['type'], item?: Resource | Item } }
  | { type: 'CLEAR_LOG' }
  | { type: 'TRIGGER_ENCOUNTER'; payload: FixedEncounter }
  | { type: 'GATHER'; payload: { resource: Resource; amount: number } }
  | { type: 'CRAFT'; payload: { recipeId: string } }
  | { type: 'BUILD_STRUCTURE'; payload: { recipeId: string } }
  | { type: 'COMPLETE_QUEST'; payload: { questId: string } }
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
  | { type: 'UNEQUIP'; payload: { slot: EquipmentSlot } }
  | { type: 'UPGRADE_STORAGE' }
  | { type: 'UPGRADE_ENERGY' }
  | { type: 'UPGRADE_HUNGER' }
  | { type: 'UPGRADE_THIRST' }
  | { type: 'UPGRADE_HEALTH' }
  | { type: 'UPGRADE_DRONE' }
  | { type: 'TRAVEL'; payload: { locationId: LocationId } }
  | { type: 'SEND_DRONE' }
  | { type: 'DRONE_RETURN'; payload: { resources: Partial<Record<Resource, number>> } }
  | { type: 'SET_THEME'; payload: Theme };
