// src/contexts/game-context.tsx
'use client';

import React, { createContext, useReducer, useEffect, type ReactNode } from 'react';
import type { GameState, GameAction, LogMessage, Resource } from '@/lib/game-types';
import { initialState } from '@/lib/game-data/initial-state';
import { recipes } from '@/lib/game-data/recipes';
import { itemData } from '@/lib/game-data/items';

const SAVE_KEY = 'wastelandAutomata_save';
const INVENTORY_CAP = 200;

let logIdCounter = 0;

const reducer = (state: GameState, action: GameAction): GameState => {
  const generateUniqueLogId = () => {
    // Combine timestamp with a counter to ensure uniqueness
    return Date.now() + logIdCounter++;
  };

  const addResource = (inventory: GameState['inventory'], resource: Resource, amount: number) => {
    const newInventory = { ...inventory };
    newInventory[resource] = Math.min(INVENTORY_CAP, newInventory[resource] + amount);
    return newInventory;
  };

  switch (action.type) {
    case 'INITIALIZE': {
      const loadedState = action.payload;
      // Reset the counter based on the highest existing ID to prevent future collisions
      if (loadedState.log && loadedState.log.length > 0) {
        const maxId = loadedState.log.reduce((max, l) => Math.max(max, l.id), 0);
        // Ensure the new counter starts well after any existing ID
        logIdCounter = (maxId > Date.now()) ? (maxId - Date.now() + 1) : 1;
      } else {
        logIdCounter = 1;
      }
      return { ...loadedState, isInitialized: true };
    }

    case 'GAME_TICK': {
      let newStats = { ...state.playerStats };
      let newInventory = { ...state.inventory };
      const logMessages: LogMessage[] = [];
      
      if (state.isResting || state.smeltingQueue > 0 || newStats.health <= 0) return state;
      
      // Passive systems
      if(state.builtStructures.includes('waterPurifier') && newInventory.water < INVENTORY_CAP) {
        newInventory.water = Math.min(INVENTORY_CAP, newInventory.water + 1);
        // We don't log this every tick to avoid spam
      }

      // Passive energy regeneration
      if(newStats.energy < 100) {
        newStats.energy = Math.min(100, newStats.energy + 1);
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
      }

      return {
        ...state,
        playerStats: newStats,
        inventory: newInventory,
        gameTick: state.gameTick + 1,
        log: [...state.log, ...logMessages],
      };
    }

    case 'TRIGGER_ENCOUNTER': {
      const encounter = action.payload;
      let newInventory = { ...state.inventory };
      let newStats = { ...state.playerStats };
      let newEquipment = { ...state.equipment };
      let logText = encounter.message;
    
      if (encounter.type === 'positive' && encounter.reward) {
        const { item, amount } = encounter.reward;
        newInventory[item] = Math.min(INVENTORY_CAP, (newInventory[item] || 0) + amount);
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
        log: [...state.log, { id: generateUniqueLogId(), text: logText, type: encounter.type === 'positive' ? 'success' : 'danger', timestamp: Date.now() }],
      };
    }

    case 'ADD_LOG':
      return {
        ...state,
        log: [...state.log, { ...action.payload, id: generateUniqueLogId(), timestamp: Date.now() }],
      };

    case 'GATHER': {
      const { resource, amount } = action.payload;
      return { ...state, inventory: addResource(state.inventory, resource, amount) };
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
          log: [...state.log, { id: generateUniqueLogId(), text: "Not enough resources to build this.", type: 'danger', timestamp: Date.now() }],
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
      
      const logMessageText = recipe.id === 'recipe_waterPurifier' 
        ? `You built a Water Purifier. It will passively generate water.`
        : `You built a ${recipe.name}.`;

      return {
        ...state,
        inventory: newInventory,
        builtStructures: newBuiltStructures,
        unlockedRecipes: newUnlockedRecipes,
        log: [...state.log, { id: generateUniqueLogId(), text: logMessageText, type: 'craft', timestamp: Date.now() }],
      };
    }

    case 'CRAFT': {
      const recipe = recipes.find((r) => r.id === action.payload.recipeId);
      if (!recipe) return state;

      const newInventory = { ...state.inventory };
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
          log: [...state.log, { id: generateUniqueLogId(), text: "Not enough resources to craft this.", type: 'danger', timestamp: Date.now() }],
        };
      }

      if(newInventory[recipe.creates] >= INVENTORY_CAP) {
        return {
          ...state,
          log: [...state.log, { id: generateUniqueLogId(), text: `You can't carry any more ${recipe.name}.`, type: 'danger', timestamp: Date.now() }],
        };
      }
      
      for (const [resource, requiredAmount] of Object.entries(recipe.requirements)) {
        newInventory[resource as keyof typeof newInventory] -= requiredAmount;
      }
      
      newInventory[recipe.creates] = Math.min(INVENTORY_CAP, newInventory[recipe.creates] + 1);
      
      const newUnlockedRecipes = [...state.unlockedRecipes];
      recipes.forEach(r => {
        if(r.unlockedBy.includes(recipe.creates) && !newUnlockedRecipes.includes(r.id)) {
          newUnlockedRecipes.push(r.id);
        }
      });
      
      return {
        ...state,
        inventory: newInventory,
        unlockedRecipes: newUnlockedRecipes,
        log: [...state.log, { id: generateUniqueLogId(), text: `Crafted ${recipe.name}.`, type: 'craft', timestamp: Date.now() }],
      };
    }

    case 'SELL_ITEM': {
      const { item, amount, price } = action.payload;
      const newInventory = { ...state.inventory };

      if (state.lockedItems.includes(item)) {
        return {
          ...state,
          log: [...state.log, { id: generateUniqueLogId(), text: `${itemData[item].name} is locked and cannot be sold.`, type: 'danger', timestamp: Date.now() }],
        }
      }

      if (newInventory[item] < amount) {
        return {
          ...state,
          log: [...state.log, { id: generateUniqueLogId(), text: `Not enough ${itemData[item].name} to sell.`, type: 'danger', timestamp: Date.now() }],
        }
      }

      newInventory[item] -= amount;
      newInventory.silver += amount * price;

      return {
        ...state,
        inventory: newInventory,
        log: [...state.log, { id: generateUniqueLogId(), text: `Sold ${amount} ${itemData[item].name} for ${amount * price} silver.`, type: 'success', timestamp: Date.now() }],
      }
    }

    case 'SELL_ALL_UNLOCKED': {
      const newInventory = { ...state.inventory };
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
            log: [...state.log, { id: generateUniqueLogId(), text: `No unlocked items to sell.`, type: 'info', timestamp: Date.now() }],
        }
      }

      newInventory.silver += totalSilverGained;

      return {
        ...state,
        inventory: newInventory,
        log: [...state.log, { id: generateUniqueLogId(), text: `Sold all unlocked goods for ${totalSilverGained} silver.`, type: 'success', timestamp: Date.now() }],
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
      newStats.energy = Math.min(100, newStats.energy + amount);
      return {...state, playerStats: newStats };
    }

    case 'EAT': {
      if (state.inventory.apple <= 0) return state;

      const newInventory = { ...state.inventory, apple: state.inventory.apple - 1 };
      const newStats = { ...state.playerStats };
      newStats.hunger = Math.min(100, newStats.hunger + 40);
      newStats.health = Math.min(100, newStats.health + 5);

      return {
        ...state,
        inventory: newInventory,
        playerStats: newStats,
        log: [...state.log, { id: generateUniqueLogId(), text: "You eat an apple, restoring some health and hunger.", type: 'success', timestamp: Date.now() }],
      };
    }

    case 'DRINK': {
      if (state.inventory.water <= 0) return state;

      const newInventory = { ...state.inventory, water: state.inventory.water - 1 };
      const newStats = { ...state.playerStats };
      newStats.thirst = Math.min(100, newStats.thirst + 40);

      return {
        ...state,
        inventory: newInventory,
        playerStats: newStats,
        log: [...state.log, { id: generateUniqueLogId(), text: "You drink some water, quenching your thirst.", type: 'success', timestamp: Date.now() }],
      };
    }

    case 'EAT_COOKED_APPLE': {
        if (state.inventory.cookedApple <= 0) return state;
  
        const newInventory = { ...state.inventory, cookedApple: state.inventory.cookedApple - 1 };
        const newStats = { ...state.playerStats };
        newStats.energy = Math.min(100, newStats.energy + 20);
        newStats.hunger = Math.min(100, newStats.hunger + 10);
  
        return {
          ...state,
          inventory: newInventory,
          playerStats: newStats,
          log: [...state.log, { id: generateUniqueLogId(), text: "You eat the cooked apple. You feel a surge of energy.", type: 'success', timestamp: Date.now() }],
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
            log: [...state.log, { id: generateUniqueLogId(), text: `Equipped ${itemData[item].name}.`, type: 'info', timestamp: Date.now() }],
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
            log: [...state.log, { id: generateUniqueLogId(), text: `Unequipped ${itemData[itemToUnequip].name}.`, type: 'info', timestamp: Date.now() }],
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
          log: [...state.log, { id: generateUniqueLogId(), text: "Not enough resources to start smelting.", type: 'danger', timestamp: Date.now() }],
        };
      }
      
      newInventory.scrap -= totalScrapNeeded;
      newInventory.wood -= totalWoodNeeded;

      return { 
        ...state, 
        inventory: newInventory,
        smeltingQueue: state.smeltingQueue + amount,
        log: [...state.log, { id: generateUniqueLogId(), text: `The furnace roars to life... Queued ${amount} batch(es).`, type: 'info', timestamp: Date.now() }],
      };
    }

    case 'FINISH_SMELTING': {
        if (state.smeltingQueue <= 0) return state;

        const newInventory = { ...state.inventory };
        newInventory.components = Math.min(INVENTORY_CAP, newInventory.components + 1);

        const newSmeltingQueue = state.smeltingQueue - 1;
        
        let logMessage = "The furnace cools. You retrieve 1 Component.";
        if (newSmeltingQueue === 0) {
          logMessage += " The queue is empty.";
        }

        return {
            ...state,
            inventory: newInventory,
            smeltingQueue: newSmeltingQueue,
            log: [...state.log, { id: generateUniqueLogId(), text: logMessage, type: 'craft', timestamp: Date.now() }],
        };
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
  const [gameState, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const savedGame = localStorage.getItem(SAVE_KEY);
      if (savedGame) {
        const loadedState = JSON.parse(savedGame);
        // Ensure new properties exist on old save files
        const migratedState = { ...initialState, ...loadedState };
        migratedState.isResting = false; // Never load into a resting state
        migratedState.smeltingQueue = 0; // Never load into a smelting state
        if (!migratedState.builtStructures) { // migration for old saves
          migratedState.builtStructures = [];
          if (migratedState.inventory.workbench > 0) {
            migratedState.builtStructures.push('workbench');
          }
        }
        if (!migratedState.lockedItems) { // migration for locked items
          migratedState.lockedItems = [];
        }
        dispatch({ type: 'INITIALIZE', payload: migratedState });
      } else {
        dispatch({ type: 'INITIALIZE', payload: initialState });
      }
    } catch (error) {
      console.error("Failed to load game from localStorage", error);
      dispatch({ type: 'INITIALIZE', payload: initialState });
    }
  }, []);

  useEffect(() => {
    if (gameState.isInitialized) {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
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
