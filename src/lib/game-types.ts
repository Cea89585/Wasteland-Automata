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
  appleSeeds: 'Apple Seeds',
  silver: 'Silver',
  mutatedTwigs: 'Mutated Twigs',
  ironIngot: 'Iron Ingot',
  biomass: 'Biomass',
  charcoal: 'Charcoal',
  sand: 'Sand',
  glassTube: 'Glass Tube',
  glassJar: 'Glass Jar',
  pickledPeaches: 'Pickled Peaches',
  iron: 'Iron Ore',
  rawFish: 'Raw Fish',
  rawSalmon: 'Raw Salmon',
  rawTuna: 'Raw Tuna',
  rawShark: 'Raw Shark',
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
  pickaxe: 'Pickaxe',
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
  timesFished: number;
  timesMined: number;
  deaths: number;
  totalItemsGained: Partial<Record<Resource | Item, number>>;
  itemsCrafted: Partial<Record<Resource | Item, number>>;
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

export type NPCId = 'silas' | 'kael' | 'elara' | 'anya' | 'marcus' | 'vera' | 'rook' | 'chen';

export interface LoreEntry {
  id: string;
  title: string;
  content: string;
  category: 'history' | 'character' | 'location' | 'technology';
  unlockedBy?: string; // quest ID that unlocks this
}

export interface FarmPlot {
  id: number;
  seed: Resource | null;
  plantedTimestamp: number | null;
  duration: number; // ms
}

export type DroneMissionType = 'scavenge' | 'mine' | 'fish';

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
  isIdle: boolean;
  energyLevel: number;
  hungerLevel: number;
  thirstLevel: number;
  healthLevel: number;
  droneLevel: number;
  farmPlotLevel: number;
  machineSlotLevel: number;
  automationSpeedLevel: number;
  explorationEfficiencyLevel: number;
  hasFishingLuck: boolean;
  restEfficiencyLevel: number;
  isInitialized: boolean;
  gameTick: number;
  isResting: boolean;
  smeltingQueue: number;
  ironIngotSmeltingQueue: number;
  charcoalSmeltingQueue: number;
  droneIsActive: boolean;
  droneReturnTimestamp: number | null;
  droneMissionQueue: number;
  droneMissionType: DroneMissionType | null;
  power: number;
  powerDrainCounter: number; // Tracks ticks for slower power drain
  theme: Theme;
  lastSavedTimestamp?: number;
  lastDailyRewardClaimed: number; // timestamp
  farmPlots: FarmPlot[];
  masteryClaimed: Partial<Record<Resource | Item, number>>;
  machines: Machine[];
  powerCapacity: number;
  powerConsumption: number;
  skills: Record<string, number>; // skill ID -> level
  npcReputation: Partial<Record<NPCId, number>>; // NPC ID -> reputation (-100 to 100)
  unlockedLore: string[]; // lore entry IDs
  currentFishingZone: string; // current fishing zone ID
  caughtFish: Partial<Record<string, number>>; // fish type -> count
  smeltingTimestamps: {
    components: number | null;
    iron: number | null;
    charcoal: number | null;
  };
}

export type MachineType = 'miner' | 'smelter' | 'constructor' | 'biomassBurner';

export interface Machine {
  id: string;
  type: MachineType;
  recipeId: string | null;
  status: 'idle' | 'running' | 'no_power' | 'output_full' | 'input_starved' | 'no_fuel';
  inputBuffer: Partial<Inventory>;
  outputBuffer: Partial<Inventory>;
  targetNodeId: string | null; // For miners, could be a resource node ID
  connectedOutput: string | null; // ID of the machine this one pushes to
  fuelLevel: number; // For biomass burners
  processingProgress: number; // Ticks elapsed in current processing cycle
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
  | { type: 'SELL_ITEM'; payload: { itemId: string; amount: number } }
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
  | { type: 'UPGRADE_FARM_PLOT' }
  | { type: 'UPGRADE_MACHINE_SLOT' }
  | { type: 'UPGRADE_AUTOMATION_SPEED' }
  | { type: 'UPGRADE_EXPLORATION_EFFICIENCY' }
  | { type: 'UPGRADE_FISHING_LUCK' }
  | { type: 'UPGRADE_REST_EFFICIENCY' }
  | { type: 'TRAVEL'; payload: { locationId: LocationId } }
  | { type: 'QUEUE_DRONE_MISSIONS', payload: { amount: number; type?: DroneMissionType } }
  | { type: 'FINISH_DRONE_MISSION' }
  | { type: 'ADD_FUEL', payload: { fuelType: 'wood' | 'biomass' | 'charcoal' } }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'CLAIM_DAILY_REWARD' }
  | { type: 'PLANT_SEED'; payload: { plotId: number, seed: Resource } }
  | { type: 'HARVEST_CROP'; payload: { plotId: number } }
  | { type: 'CHEAT_ADD_SILVER' }
  | { type: 'CLAIM_MASTERY_REWARD'; payload: { itemId: string, tier: number } }
  | { type: 'BUILD_MACHINE'; payload: { type: MachineType } }
  | { type: 'CONFIGURE_MACHINE'; payload: { machineId: string, recipeId: string | null } }
  | { type: 'CONNECT_MACHINES'; payload: { sourceId: string, targetId: string | null } }
  | { type: 'ADD_MACHINE_FUEL'; payload: { machineId: string, fuelType: Resource } }
  | { type: 'TRANSFER_TO_MACHINE'; payload: { machineId: string, resource: Resource | Item, amount: number } }
  | { type: 'TRANSFER_FROM_MACHINE'; payload: { machineId: string, resource: Resource | Item, amount: number } }
  | { type: 'UNLOCK_SKILL'; payload: { skillId: string } }
  | { type: 'FISH'; payload: { zoneId: string } }
  | { type: 'SELL_ALL_FISH' }
  | { type: 'SET_FISHING_ZONE'; payload: { zoneId: string } }
  | { type: 'MINE' };
