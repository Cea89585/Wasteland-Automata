// src/contexts/game-context.tsx
'use client';

import React, { createContext, useReducer, useEffect, type ReactNode } from 'react';
import type { GameState, GameAction, LogMessage } from '@/lib/game-types';
import { initialState } from '@/lib/game-data/initial-state';
import { recipes } from '@/lib/game-data/recipes';

const SAVE_KEY = 'wastelandAutomata_save';

const reducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'INITIALIZE':
      return { ...action.payload, isInitialized: true };

    case 'GAME_TICK': {
      const newStats = { ...state.playerStats };
      newStats.thirst = Math.max(0, newStats.thirst - 1);
      newStats.hunger = Math.max(0, newStats.hunger - 0.5);

      if (newStats.thirst === 0 || newStats.hunger === 0) {
        newStats.health = Math.max(0, newStats.health - 2);
      }

      const logMessages: LogMessage[] = [];
      if (state.playerStats.health > 0 && newStats.health === 0) {
        logMessages.push({
          id: Date.now(),
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
        log: [...state.log, { ...action.payload, id: Date.now(), timestamp: Date.now() }],
      };

    case 'GATHER': {
      const { resource, amount } = action.payload;
      const newInventory = { ...state.inventory };
      newInventory[resource] += amount;
      return { ...state, inventory: newInventory };
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
          log: [...state.log, { id: Date.now(), text: "Not enough resources to craft this.", type: 'danger', timestamp: Date.now() }],
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
        log: [...state.log, { id: Date.now(), text: `Crafted ${recipe.name}.`, type: 'craft', timestamp: Date.now() }],
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
        log: [...state.log, { id: Date.now(), text: "You eat some food, restoring some health and hunger.", type: 'success', timestamp: Date.now() }],
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
        log: [...state.log, { id: Date.now(), text: "You drink some water, quenching your thirst.", type: 'success', timestamp: Date.now() }],
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
          log: [...state.log, { id: Date.now(), text: "You eat the cooked apple. You feel a surge of energy.", type: 'success', timestamp: Date.now() }],
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
        dispatch({ type: 'INITIALIZE', payload: JSON.parse(savedGame) });
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
