// src/contexts/game-context.tsx
'use client';

import React, { createContext, useReducer, useEffect, type ReactNode } from 'react';
import type { GameState, GameAction, LogMessage } from '@/lib/game-types';
import { initialState } from '@/lib/game-data/initial-state';
import { recipes } from '@/lib/game-data/recipes';

const SAVE_KEY = 'wastelandAutomata_save';

let logIdCounter = 0;

const reducer = (state: GameState, action: GameAction): GameState => {
  const generateUniqueLogId = () => {
    const newId = Date.now() + logIdCounter;
    logIdCounter++;
    return newId;
  };

  switch (action.type) {
    case 'INITIALIZE': {
      const loadedState = action.payload;
      if (loadedState.log && loadedState.log.length > 0) {
        logIdCounter = loadedState.log.reduce((max, l) => Math.max(max, l.id), 0) + 1;
      } else {
        logIdCounter = 1;
      }
      return { ...loadedState, isInitialized: true };
    }

    case 'GAME_TICK': {
      let newStats = { ...state.playerStats };
      let hasChanged = false;

      if (state.isResting) return state;
      
      // Passive energy regeneration
      if(newStats.energy < 100) {
        newStats.energy = Math.min(100, newStats.energy + 1);
        hasChanged = true;
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


      const logMessages: LogMessage[] = [];
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
        gameTick: state.gameTick + 1,
        log: [...state.log, ...logMessages],
      };
    }

    case 'ADD_LOG':
      return {
        ...state,
        log: [...state.log, { ...action.payload, id: generateUniqueLogId(), timestamp: Date.now() }],
      };

    case 'GATHER': {
      const { resource, amount } = action.payload;
      const newInventory = { ...state.inventory };
      newInventory[resource] += amount;
      return { ...state, inventory: newInventory };
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

      return {
        ...state,
        inventory: newInventory,
        builtStructures: newBuiltStructures,
        unlockedRecipes: newUnlockedRecipes,
        log: [...state.log, { id: generateUniqueLogId(), text: `You built a ${recipe.name}.`, type: 'craft', timestamp: Date.now() }],
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
      
      for (const [resource, requiredAmount] of Object.entries(recipe.requirements)) {
        newInventory[resource as keyof typeof newInventory] -= requiredAmount;
      }
      
      newInventory[recipe.creates] += 1;
      
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
    
    case 'CONSUME': {
        const { stat, amount } = action.payload;
        const newStats = { ...state.playerStats };
        newStats[stat] = Math.max(0, newStats[stat] - amount);
        return {...state, playerStats: newStats };
    }

    case 'REGEN_ENERGY': {
      const { amount } = action.payload;
      const newStats = { ...state.playerStats };
      newStats.energy = Math.min(100, newStats.energy + amount);
      return {...state, playerStats: newStats };
    }

    case 'EAT': {
      if (state.inventory.food <= 0) return state;

      const newInventory = { ...state.inventory, food: state.inventory.food - 1 };
      const newStats = { ...state.playerStats };
      newStats.hunger = Math.min(100, newStats.hunger + 40);
      newStats.health = Math.min(100, newStats.health + 5);

      return {
        ...state,
        inventory: newInventory,
        playerStats: newStats,
        log: [...state.log, { id: generateUniqueLogId(), text: "You eat some food, restoring some health and hunger.", type: 'success', timestamp: Date.now() }],
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
        newStats.energy = Math.min(100, newStats.energy + 50);
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
            log: [...state.log, { id: generateUniqueLogId(), text: `Equipped ${item}.`, type: 'info', timestamp: Date.now() }],
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
            log: [...state.log, { id: generateUniqueLogId(), text: `Unequipped ${itemToUnequip}.`, type: 'info', timestamp: Date.now() }],
        };
    }

    case 'START_RESTING':
        return { ...state, isResting: true };

    case 'FINISH_RESTING':
        return { ...state, isResting: false };

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
        if (!migratedState.builtStructures) { // migration for old saves
          migratedState.builtStructures = [];
          if (migratedState.inventory.workbench > 0) {
            migratedState.builtStructures.push('workbench');
          }
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
