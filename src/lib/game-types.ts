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
  silver: 'Silver',
  mutatedTwigs: 'Mutated Twigs',
  ironIngot: 'Iron Ingot',
  biomass: 'Biomass',
  charcoal: 'Charcoal',
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
  ironPlates: 'Iron Plates',
  biomassCompressor: 'Biomass Compressor',
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
  characterName: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  upgradePoints: number;
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
  ironIngotSmeltingQueue: number;
  charcoalSmeltingQueue: number;
  droneIsActive: boolean;
  droneReturnTimestamp: number | null;
  droneMissionQueue: number;
  power: number;
  theme: Theme;
  lastSavedTimestamp?: number;
}

export type GameAction =
  | { type: 'INITIALIZE'; payload: { gameState: Omit<GameState, 'statistics'>, statistics: Statistics } }
  | { type: 'SET_GAME_STATE', payload: Partial<GameState> }
  | { type: 'RESET_GAME' }
  | { type: 'RESET_GAME_NO_LOCALSTORAGE' }
  | { type: 'SET_CHARACTER_NAME'; payload: string }
  | { type: 'GAME_TICK' }
  | { type: 'SET_IDLE', payload: boolean }
  | { type: 'ADD_XP', payload: number }
  | { type: 'TRACK_STAT'; payload: { stat: keyof Pick<Statistics, 'timesExplored' | 'timesScavenged'> } }
  | { type: 'ADD_LOG'; payload: { text: string; type: LogMessage['type'], item?: Resource | Item } }
  | { type: 'CLEAR_LOG' }
  | { type: 'TRIGGER_ENCOUNTER'; payload: FixedEncounter }
  | { type: 'GATHER'; payload: { resource: Resource; amount: number } }
  | { type: 'CRAFT'; payload: { recipeId: string } }
  | { type: 'CRAFT_ALL', payload: { recipeId: string; amount: number } }
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
  | { type: 'START_SMELTING' }
  | { type: 'FINISH_SMELTING' }
  | { type: 'START_SMELTING_ALL'; payload: { type: 'components' | 'iron' | 'charcoal'; amount: number } }
  | { type: 'START_SMELTING_IRON' }
  | { type: 'FINISH_SMELTING_IRON' }
  | { type: 'START_SMELTING_CHARCOAL' }
  | { type: 'FINISH_SMELTING_CHARCOAL' }
  | { type: 'EQUIP'; payload: { item: Item, slot: EquipmentSlot } }
  | { type: 'UNEQUIP'; payload: { slot: EquipmentSlot } }
  | { type: 'UPGRADE_STORAGE' }
  | { type: 'UPGRADE_ENERGY' }
  | { type: 'UPGRADE_HUNGER' }
  | { type: 'UPGRADE_THIRST' }
  | { type: 'UPGRADE_HEALTH' }
  | { type: 'UPGRADE_DRONE' }
  | { type: 'TRAVEL'; payload: { locationId: LocationId } }
  | { type: 'QUEUE_DRONE_MISSIONS', payload: { amount: number } }
  | { type: 'ADD_FUEL', payload: { fuelType: 'wood' | 'biomass' | 'charcoal' } }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'CHEAT_ADD_SILVER' };
