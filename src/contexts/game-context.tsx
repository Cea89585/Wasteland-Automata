// src/contexts/game-context.tsx
'use client';

import React, { createContext, useReducer, useEffect, type ReactNode } from 'react';
import type { GameState, GameAction, LogMessage, Resource, Item, Statistics } from '@/lib/game-types';
import { initialState, initialStatistics } from '@/lib/game-data/initial-state';
import { recipes } from '@/lib/game-data/recipes';
import { itemData } from '@/lib/game-data/items';

const SAVE_KEY = 'wastelandAutomata_save';
const STATS_KEY = 'wastelandAutomata_stats';

let logIdCounter = 0;

const reducer = (state: GameState, action: GameAction): GameState => {
  const getInventoryCap = () => 200 + (state.storageLevel || 0) * 50;
  const getMaxEnergy = () => 100 + (state.energyLevel || 0) * 5;
  const getMaxHunger = () => 100 + (state.hungerLevel || 0) * 25;
  const getMaxThirst = () => 100 + (state.thirstLevel || 0) * 25;

  const generateUniqueLogId = () => {
    // Combine timestamp with a counter to ensure uniqueness
    return Date.now() + logIdCounter++;
  };

  const addResource = (inventory: GameState['inventory'], statistics: GameState['statistics'], resource: Resource | Item, amount: number) => {
    const INVENTORY_CAP = getInventoryCap();
    const newInventory = { ...inventory };
    newInventory[resource] = Math.min(INVENTORY_CAP, newInventory[resource] + amount);
    
    const newStatistics = { ...statistics };
    const newTotalItemsGained = { ...newStatistics.totalItemsGained };
    newTotalItemsGained[resource] = (newTotalItemsGained[resource] || 0) + amount;
    newStatistics.totalItemsGained = newTotalItemsGained;

    return { newInventory, newStatistics };
  };

  switch (action.type) {
    case 'INITIALIZE': {
      const { gameState, statistics } = action.payload;
      if (gameState.log && gameState.log.length > 0) {
        const maxId = gameState.log.reduce((max, l) => Math.max(max, l.id), 0);
        logIdCounter = (maxId > Date.now()) ? (maxId - Date.now() + 1) : 1;
      } else {
        logIdCounter = 1;
      }
      return { ...gameState, statistics, isInitialized: true };
    }
    
    case 'RESET_GAME': {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(STATS_KEY);
      window.location.reload();
      return state;
    }

    case 'GAME_TICK': {
      let newStats = { ...state.playerStats };
      let newInventory = { ...state.inventory };
      const logMessages: LogMessage[] = [];
      const INVENTORY_CAP = getInventoryCap();
      const MAX_ENERGY = getMaxEnergy();
      
      if (state.isResting || state.smeltingQueue > 0 || newStats.health <= 0) return state;
      
      // Passive systems
      if(state.builtStructures.includes('waterPurifier') && newInventory.water < INVENTORY_CAP) {
        newInventory.water = Math.min(INVENTORY_CAP, newInventory.water + 1);
        // We don't log this every tick to avoid spam
      }

      // Passive energy regeneration
      if(newStats.energy < MAX_ENERGY) {
        newStats.energy = Math.min(MAX_ENERGY, newStats.energy + 1);
      }

      newStats.thirst = Math.max(0, newStats.thirst - 1);
      newStats.hunger = Math.max(0, newStats.hunger - 0.5);

      if (newStats.thirst === 0 || newStats.hunger === 0) {
        newStats.health = Math.max(0, newStats.health - 2);
      } else if (newStats.thirst < 20 || newStats.hunger < 20) {
        // No health regen if starving or dehydrated
      } else {
        // Slow health regeneration if well-fed and hydrated
        if (newStats.health < 100) {
            newStats.health = Math.min(100, newStats.health + 0.5);
        }
      }

      if (state.playerStats.health > 0 && newStats.health <= 0) {
        logMessages.push({
          id: generateUniqueLogId(),
          text: 'Your vision fades to black. The wasteland has claimed another soul.',
          timestamp: Date.now(),
          type: 'danger',
        });
        const newStatistics = { ...state.statistics, deaths: state.statistics.deaths + 1 };
        localStorage.setItem(STATS_KEY, JSON.stringify(newStatistics));
        return {
          ...state,
          playerStats: newStats,
          statistics: newStatistics,
          log: [...logMessages, ...state.log],
        }
      }

      return {
        ...state,
        playerStats: newStats,
        inventory: newInventory,
        gameTick: state.gameTick + 1,
        log: [...logMessages, ...state.log],
      };
    }

    case 'TRIGGER_ENCOUNTER': {
      const encounter = action.payload;
      let newInventory = { ...state.inventory };
      let newStats = { ...state.playerStats };
      let newEquipment = { ...state.equipment };
      let newStatistics = { ...state.statistics };
      let logText = encounter.message;
    
      if (encounter.type === 'positive' && encounter.reward) {
        const { item, amount } = encounter.reward;
        const { newInventory: updatedInventory, newStatistics: updatedStatistics } = addResource(newInventory, newStatistics, item, amount);
        newInventory = updatedInventory;
        newStatistics = updatedStatistics;
        logText += ` You found ${amount} ${itemData[item].name}.`;
      }
    
      if (encounter.type === 'negative' && encounter.penalty) {
        const { type: penaltyType, amount } = encounter.penalty;
        if (penaltyType === 'health') {
          newStats.health = Math.max(0, newStats.health - amount);
          logText += ` You lost ${amount} health.`;
        } else if (penaltyType === 'stoneAxe') {
          // Special case for breaking the equipped item
          if (newEquipment.hand === 'stoneAxe') {
            newEquipment.hand = null;
            // Log message is already descriptive, no need to add more text
          } else {
            // Axe not equipped, so it can't break from use. Don't apply penalty.
            // We'll also prevent the log message from showing to avoid confusion.
            return state; // Exit early
          }
        }
        else { // For all other resource/item penalties
          const currentAmount = newInventory[penaltyType] || 0;
          const amountLost = Math.min(currentAmount, amount);
          if (amountLost > 0) {
            newInventory[penaltyType] = currentAmount - amountLost;
            logText += ` You lost ${amountLost} ${itemData[penaltyType].name}.`;
          } else {
            // Player didn't have the item to lose, so don't show the encounter message.
            return state;
          }
        }
      }
    
      return {
        ...state,
        inventory: newInventory,
        playerStats: newStats,
        equipment: newEquipment,
        statistics: newStatistics,
        log: [{ id: generateUniqueLogId(), text: logText, type: encounter.type === 'positive' ? 'success' : 'danger', timestamp: Date.now() }, ...state.log],
      };
    }

    case 'TRACK_STAT': {
      const { stat } = action.payload;
      const newStatistics = { ...state.statistics };
      newStatistics[stat] = (newStatistics[stat] || 0) + 1;
      return {
        ...state,
        statistics: newStatistics,
      };
    }

    case 'ADD_LOG': {
      const { item, ...rest } = action.payload;
      return {
        ...state,
        log: [{ ...rest, item, id: generateUniqueLogId(), timestamp: Date.now() }, ...state.log],
      };
    }

    case 'CLEAR_LOG': {
      return {
        ...state,
        log: [],
      }
    }

    case 'GATHER': {
      const { resource, amount } = action.payload;
      const { newInventory, newStatistics } = addResource(state.inventory, state.statistics, resource, amount);
      return { ...state, inventory: newInventory, statistics: newStatistics };
    }

    case 'BUILD_STRUCTURE': {
      const recipe = recipes.find((r) => r.id === action.payload.recipeId);
      if (!recipe) return state;

      const newInventory = { ...state.inventory };
      let canBuild = true;

      for (const [resource, requiredAmount] of Object.entries(recipe.requirements)) {
        if (newInventory[resource as keyof typeof newInventory] < requiredAmount) {
          canBuild = false;
          break;
        }
      }
      if (!canBuild) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: "Not enough resources to build this.", type: 'danger', timestamp: Date.now() }, ...state.log],
        };
      }
      
      for (const [resource, requiredAmount] of Object.entries(recipe.requirements)) {
        newInventory[resource as keyof typeof newInventory] -= requiredAmount;
      }
      
      const newBuiltStructures = [...state.builtStructures, recipe.creates];

      const newUnlockedRecipes = [...state.unlockedRecipes];
      recipes.forEach(r => {
        if(r.unlockedBy.includes(recipe.creates) && !newUnlockedRecipes.includes(r.id)) {
          newUnlockedRecipes.push(r.id);
        }
      });
      
      const itemDetails = itemData[recipe.creates];
      const logMessageText = `You built a ${itemDetails.name}.\n${itemDetails.description}`;
      const { newStatistics } = addResource(state.inventory, state.statistics, recipe.creates, 1);

      return {
        ...state,
        inventory: newInventory,
        builtStructures: newBuiltStructures,
        unlockedRecipes: newUnlockedRecipes,
        statistics: newStatistics,
        log: [{ id: generateUniqueLogId(), text: logMessageText, type: 'craft', item: recipe.creates, timestamp: Date.now() }, ...state.log],
      };
    }

    case 'CRAFT': {
      const recipe = recipes.find((r) => r.id === action.payload.recipeId);
      if (!recipe) return state;
      const INVENTORY_CAP = getInventoryCap();

      let newInventory = { ...state.inventory };
      let canCraft = true;

      for (const [resource, requiredAmount] of Object.entries(recipe.requirements)) {
        if (newInventory[resource as keyof typeof newInventory] < requiredAmount) {
          canCraft = false;
          break;
        }
      }

      if (!canCraft) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: "Not enough resources to craft this.", type: 'danger', timestamp: Date.now() }, ...state.log],
        };
      }

      if(newInventory[recipe.creates] >= INVENTORY_CAP) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: `You can't carry any more ${itemData[recipe.creates].name}.`, type: 'danger', timestamp: Date.now() }, ...state.log],
        };
      }
      
      for (const [resource, requiredAmount] of Object.entries(recipe.requirements)) {
        newInventory[resource as keyof typeof newInventory] -= requiredAmount;
      }
      
      const { newInventory: finalInventory, newStatistics } = addResource(newInventory, state.statistics, recipe.creates, 1);
      
      const newUnlockedRecipes = [...state.unlockedRecipes];
      recipes.forEach(r => {
        if(r.unlockedBy.includes(recipe.creates) && !newUnlockedRecipes.includes(r.id)) {
          newUnlockedRecipes.push(r.id);
        }
      });

      const itemDetails = itemData[recipe.creates];
      const logMessageText = `Crafted ${itemDetails.name}.\n${itemDetails.description}`;
      
      return {
        ...state,
        inventory: finalInventory,
        statistics: newStatistics,
        unlockedRecipes: newUnlockedRecipes,
        log: [{ id: generateUniqueLogId(), text: logMessageText, type: 'craft', item: recipe.creates, timestamp: Date.now() }, ...state.log],
      };
    }

    case 'SELL_ITEM': {
      const { item, amount, price } = action.payload;
      const newInventory = { ...state.inventory };
      let newStatistics = { ...state.statistics };

      if (state.lockedItems.includes(item)) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: `${itemData[item].name} is locked and cannot be sold.`, type: 'danger', timestamp: Date.now() }, ...state.log],
        }
      }

      if (newInventory[item] < amount) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: `Not enough ${itemData[item].name} to sell.`, type: 'danger', timestamp: Date.now() }, ...state.log],
        }
      }

      const silverEarned = amount * price;
      newInventory[item] -= amount;
      newInventory.silver += silverEarned;
      
      const newTotalItemsGained = { ...newStatistics.totalItemsGained };
      newTotalItemsGained.silver = (newTotalItemsGained.silver || 0) + silverEarned;
      newStatistics = {...newStatistics, totalItemsGained: newTotalItemsGained };


      return {
        ...state,
        inventory: newInventory,
        statistics: newStatistics,
        log: [{ id: generateUniqueLogId(), text: `Sold ${amount} ${itemData[item].name} for ${silverEarned} silver.`, type: 'success', timestamp: Date.now() }, ...state.log],
      }
    }

    case 'SELL_ALL_UNLOCKED': {
      const newInventory = { ...state.inventory };
      let newStatistics = { ...state.statistics };
      let totalSilverGained = 0;
      let itemsSold = 0;

      for (const item of Object.keys(newInventory) as (Resource[])) {
        const itemInfo = itemData[item];
        const quantity = newInventory[item];
        if (quantity > 0 && itemInfo?.sellPrice && !state.lockedItems.includes(item)) {
          const silverGained = quantity * itemInfo.sellPrice;
          totalSilverGained += silverGained;
          newInventory[item] = 0;
          itemsSold++;
        }
      }

      if (itemsSold === 0) {
        return {
            ...state,
            log: [{ id: generateUniqueLogId(), text: `No unlocked items to sell.`, type: 'info', timestamp: Date.now() }, ...state.log],
        }
      }

      newInventory.silver += totalSilverGained;

      const newTotalItemsGained = { ...newStatistics.totalItemsGained };
      newTotalItemsGained.silver = (newTotalItemsGained.silver || 0) + totalSilverGained;
      newStatistics = {...newStatistics, totalItemsGained: newTotalItemsGained };


      return {
        ...state,
        inventory: newInventory,
        statistics: newStatistics,
        log: [{ id: generateUniqueLogId(), text: `Sold all unlocked goods for ${totalSilverGained} silver.`, type: 'success', timestamp: Date.now() }, ...state.log],
      };
    }
    
    case 'TOGGLE_LOCK_ITEM': {
      const { item } = action.payload;
      const newLockedItems = [...state.lockedItems];
      const itemIndex = newLockedItems.indexOf(item);

      if (itemIndex > -1) {
        newLockedItems.splice(itemIndex, 1); // Unlock
      } else {
        newLockedItems.push(item); // Lock
      }
      return { ...state, lockedItems: newLockedItems };
    }
    
    case 'CONSUME': {
        const { stat, amount, resource } = action.payload;
        const newStats = { ...state.playerStats };
        const newInventory = { ...state.inventory };
        
        if (resource && newInventory[resource] > 0) {
            newInventory[resource] -= 1;
        } else if (resource) {
            // Not enough resource to consume, do nothing.
            return state;
        }

        newStats[stat] = Math.max(0, newStats[stat] - amount);
        return {...state, playerStats: newStats, inventory: newInventory };
    }
    
    case 'PENALTY': {
      const { stat, percentage } = action.payload;
      const newStats = { ...state.playerStats };
      const currentStatValue = newStats[stat];
      const reduction = currentStatValue * (percentage / 100);
      newStats[stat] = Math.max(0, currentStatValue - reduction);
      return {...state, playerStats: newStats };
    }

    case 'REGEN_ENERGY': {
      const { amount } = action.payload;
      const newStats = { ...state.playerStats };
      const MAX_ENERGY = getMaxEnergy();
      newStats.energy = Math.min(MAX_ENERGY, newStats.energy + amount);
      return {...state, playerStats: newStats };
    }

    case 'EAT': {
      if (state.inventory.apple <= 0) return state;
      const MAX_HUNGER = getMaxHunger();

      const newInventory = { ...state.inventory, apple: state.inventory.apple - 1 };
      const newStats = { ...state.playerStats };
      newStats.hunger = Math.min(MAX_HUNGER, newStats.hunger + 40);
      newStats.health = Math.min(100, newStats.health + 5);

      return {
        ...state,
        inventory: newInventory,
        playerStats: newStats,
        log: [{ id: generateUniqueLogId(), text: "You eat an apple, restoring some health and hunger.", type: 'success', timestamp: Date.now() }, ...state.log],
      };
    }

    case 'DRINK': {
      if (state.inventory.water <= 0) return state;
      const MAX_THIRST = getMaxThirst();

      const newInventory = { ...state.inventory, water: state.inventory.water - 1 };
      const newStats = { ...state.playerStats };
      newStats.thirst = Math.min(MAX_THIRST, newStats.thirst + 40);

      return {
        ...state,
        inventory: newInventory,
        playerStats: newStats,
        log: [{ id: generateUniqueLogId(), text: "You drink some water, quenching your thirst.", type: 'success', timestamp: Date.now() }, ...state.log],
      };
    }

    case 'EAT_COOKED_APPLE': {
        if (state.inventory.cookedApple <= 0) return state;
        
        const MAX_ENERGY = getMaxEnergy();
        const MAX_HUNGER = getMaxHunger();
        const newInventory = { ...state.inventory, cookedApple: state.inventory.cookedApple - 1 };
        const newStats = { ...state.playerStats };
        newStats.energy = Math.min(MAX_ENERGY, newStats.energy + 20);
        newStats.hunger = Math.min(MAX_HUNGER, newStats.hunger + 10);
  
        return {
          ...state,
          inventory: newInventory,
          playerStats: newStats,
          log: [{ id: generateUniqueLogId(), text: "You eat the cooked apple. You feel a surge of energy.", type: 'success', timestamp: Date.now() }, ...state.log],
        };
    }

    case 'EQUIP': {
        const { item, slot } = action.payload;
        if (state.inventory[item] < 1) return state; // Can't equip something you don't have

        const newInventory = { ...state.inventory };
        const newEquipment = { ...state.equipment };

        // Unequip current item in slot, if any
        const currentItem = newEquipment[slot];
        if (currentItem) {
            newInventory[currentItem] += 1;
        }

        // Equip new item
        newEquipment[slot] = item;
        newInventory[item] -= 1;

        return {
            ...state,
            inventory: newInventory,
            equipment: newEquipment,
            log: [{ id: generateUniqueLogId(), text: `Equipped ${itemData[item].name}.`, type: 'info', timestamp: Date.now() }, ...state.log],
        };
    }

    case 'UNEQUIP': {
        const { slot } = action.payload;
        const itemToUnequip = state.equipment[slot];
        if (!itemToUnequip) return state;

        const newInventory = { ...state.inventory };
        const newEquipment = { ...state.equipment };

        newInventory[itemToUnequip] += 1;
        newEquipment[slot] = null;

        return {
            ...state,
            inventory: newInventory,
            equipment: newEquipment,
            log: [{ id: generateUniqueLogId(), text: `Unequipped ${itemData[itemToUnequip].name}.`, type: 'info', timestamp: Date.now() }, ...state.log],
        };
    }

    case 'START_RESTING':
        return { ...state, isResting: true };

    case 'FINISH_RESTING':
        return { ...state, isResting: false };
    
    case 'START_SMELTING': {
      const { amount } = action.payload;
      const newInventory = { ...state.inventory };
      const totalScrapNeeded = 10 * amount;
      const totalWoodNeeded = 4 * amount;

      if (newInventory.scrap < totalScrapNeeded || newInventory.wood < totalWoodNeeded) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: "Not enough resources to start smelting.", type: 'danger', timestamp: Date.now() }, ...state.log],
        };
      }
      
      newInventory.scrap -= totalScrapNeeded;
      newInventory.wood -= totalWoodNeeded;

      return { 
        ...state, 
        inventory: newInventory,
        smeltingQueue: state.smeltingQueue + amount,
        log: [{ id: generateUniqueLogId(), text: `The furnace roars to life... Queued ${amount} batch(es).`, type: 'info', timestamp: Date.now() }, ...state.log],
      };
    }

    case 'FINISH_SMELTING': {
        if (state.smeltingQueue <= 0) return state;

        let { newInventory, newStatistics } = addResource(state.inventory, state.statistics, 'components', 1);

        const newSmeltingQueue = state.smeltingQueue - 1;
        
        let logMessage = `The furnace cools. You retrieve 1 Component.\n${itemData['components'].description}`;
        if (newSmeltingQueue === 0) {
          logMessage += "\nThe queue is empty.";
        }

        return {
            ...state,
            inventory: newInventory,
            statistics: newStatistics,
            smeltingQueue: newSmeltingQueue,
            log: [{ id: generateUniqueLogId(), text: logMessage, type: 'craft', item: 'components', timestamp: Date.now() }, ...state.log],
        };
    }

    case 'UPGRADE_STORAGE': {
      const calculateCost = (level: number): number => {
        if (level === 0) return 10000;
        let cost = 10000;
        for (let i = 1; i <= level; i++) {
          cost = cost * 2 + 10000;
        }
        return cost;
      };
      
      const cost = calculateCost(state.storageLevel);
      if (state.inventory.silver < cost) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: "Not enough silver to upgrade storage.", type: 'danger', timestamp: Date.now() }, ...state.log],
        }
      }

      const newInventory = { ...state.inventory };
      newInventory.silver -= cost;
      const newStorageLevel = state.storageLevel + 1;
      const newCapacity = 200 + newStorageLevel * 50;
      
      return {
        ...state,
        inventory: newInventory,
        storageLevel: newStorageLevel,
        log: [{ id: generateUniqueLogId(), text: `Storage upgraded to Level ${newStorageLevel}! New capacity: ${newCapacity}.`, type: 'success', timestamp: Date.now() }, ...state.log],
      }
    }
    
    case 'UPGRADE_ENERGY': {
      const calculateCost = (level: number): number => {
        if (level === 0) return 5000;
        let cost = 5000;
        for (let i = 1; i <= level; i++) {
          cost = cost * 2 + 1000;
        }
        return cost;
      };
      
      const cost = calculateCost(state.energyLevel);
      if (state.inventory.silver < cost) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: "Not enough silver to upgrade energy core.", type: 'danger', timestamp: Date.now() }, ...state.log],
        }
      }

      const newInventory = { ...state.inventory };
      newInventory.silver -= cost;
      const newEnergyLevel = state.energyLevel + 1;
      const newMaxEnergy = 100 + newEnergyLevel * 5;
      
      return {
        ...state,
        inventory: newInventory,
        energyLevel: newEnergyLevel,
        log: [{ id: generateUniqueLogId(), text: `Energy Core upgraded to Level ${newEnergyLevel}! New max energy: ${newMaxEnergy}.`, type: 'success', timestamp: Date.now() }, ...state.log],
      }
    }

    case 'UPGRADE_HUNGER': {
      const calculateCost = (level: number): number => {
          if (level === 0) return 5000;
          let cost = 5000;
          for (let i = 1; i <= level; i++) {
            cost = cost * 2 + 1000;
          }
          return cost;
      };
      const cost = calculateCost(state.hungerLevel);
      if (state.inventory.silver < cost) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: "Not enough silver to upgrade stomach lining.", type: 'danger', timestamp: Date.now() }, ...state.log],
        }
      }
      const newInventory = { ...state.inventory };
      newInventory.silver -= cost;
      const newHungerLevel = state.hungerLevel + 1;
      const newMaxHunger = Math.min(500, 100 + newHungerLevel * 25);
      return {
        ...state,
        inventory: newInventory,
        hungerLevel: newHungerLevel,
        log: [{ id: generateUniqueLogId(), text: `Stomach Lining upgraded to Level ${newHungerLevel}! New max hunger: ${newMaxHunger}.`, type: 'success', timestamp: Date.now() }, ...state.log],
      }
    }

    case 'UPGRADE_THIRST': {
      const calculateCost = (level: number): number => {
          if (level === 0) return 5000;
          let cost = 5000;
          for (let i = 1; i <= level; i++) {
            cost = cost * 2 + 1000;
          }
          return cost;
      };
      const cost = calculateCost(state.thirstLevel);
      if (state.inventory.silver < cost) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: "Not enough silver to upgrade hydro-recycling.", type: 'danger', timestamp: Date.now() }, ...state.log],
        }
      }
      const newInventory = { ...state.inventory };
      newInventory.silver -= cost;
      const newThirstLevel = state.thirstLevel + 1;
      const newMaxThirst = Math.min(500, 100 + newThirstLevel * 25);
      return {
        ...state,
        inventory: newInventory,
        thirstLevel: newThirstLevel,
        log: [{ id: generateUniqueLogId(), text: `Hydro-Recycling upgraded to Level ${newThirstLevel}! New max thirst: ${newMaxThirst}.`, type: 'success', timestamp: Date.now() }, ...state.log],
      }
    }

    default:
      return state;
  }
};

export const GameContext = createContext<{
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
} | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, dispatch] = useReducer(reducer, { ...initialState, statistics: initialStatistics, isInitialized: false });

  useEffect(() => {
    try {
      const savedGame = localStorage.getItem(SAVE_KEY);
      const savedStats = localStorage.getItem(STATS_KEY);
      
      let loadedState = savedGame ? JSON.parse(savedGame) : initialState;
      let loadedStats = savedStats ? JSON.parse(savedStats) : initialStatistics;

      // Ensure new properties exist on old save files
      const migratedState = { ...initialState, ...loadedState };
      const migratedStats = { ...initialStatistics, ...loadedStats };
      
      migratedState.isResting = false;
      migratedState.smeltingQueue = 0;
      
      if (!migratedState.builtStructures) {
        migratedState.builtStructures = [];
        if (migratedState.inventory.workbench > 0) {
          migratedState.builtStructures.push('workbench');
        }
      }
      if (!migratedState.lockedItems) {
        migratedState.lockedItems = [];
      }
      if (!migratedState.storageLevel) {
          migratedState.storageLevel = 0;
      }
      if (!migratedState.energyLevel) {
          migratedState.energyLevel = 0;
      }
      if (!migratedState.hungerLevel) {
          migratedState.hungerLevel = 0;
      }
      if (!migratedState.thirstLevel) {
          migratedState.thirstLevel = 0;
      }
      // IMPORTANT: Remove statistics from the main game state if it exists from an old save
      if ('statistics' in migratedState) {
        delete (migratedState as any).statistics;
      }
      
      dispatch({ type: 'INITIALIZE', payload: { gameState: migratedState, statistics: migratedStats } });

    } catch (error) {
      console.error("Failed to load game from localStorage", error);
      dispatch({ type: 'INITIALIZE', payload: { gameState: initialState, statistics: initialStatistics } });
    }
  }, []);

  useEffect(() => {
    if (gameState.isInitialized) {
      try {
        const { statistics, ...stateToSave } = gameState;
        
        // Save game state without statistics
        const savableState = { ...stateToSave };
        savableState.log = [...savableState.log].reverse();
        localStorage.setItem(SAVE_KEY, JSON.stringify(savableState));

        // Save statistics separately
        localStorage.setItem(STATS_KEY, JSON.stringify(statistics));

      } catch (error) {
        console.error("Failed to save game to localStorage", error);
      }
    }
  }, [gameState]);

  useEffect(() => {
    if (!gameState.isInitialized || gameState.playerStats.health <= 0) return;

    const tickInterval = setInterval(() => {
      dispatch({ type: 'GAME_TICK' });
    }, 15000); // Game tick every 15 seconds

    return () => clearInterval(tickInterval);
  }, [gameState.isInitialized, gameState.playerStats.health]);
  

  return (
    <GameContext.Provider value={{ gameState, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}
