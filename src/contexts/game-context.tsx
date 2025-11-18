
// src/contexts/game-context.tsx
'use client';

import React, { createContext, useReducer, useEffect, type ReactNode, useState } from 'react';
import type { GameState, GameAction, LogMessage, Resource, Item, Statistics, LocationId, Theme } from '@/lib/game-types';
import { initialState, initialStatistics } from '@/lib/game-data/initial-state';
import { recipes } from '@/lib/game-data/recipes';
import { itemData } from '@/lib/game-data/items';
import { locations } from '@/lib/game-data/locations';
import { useInactivityTimer } from '@/hooks/use-inactivity-timer';
import { locationOrder } from '@/lib/game-types';
import { quests } from '@/lib/game-data/quests';


const SAVE_KEY = 'wastelandAutomata_save';
const STATS_KEY = 'wastelandAutomata_stats';

let logIdCounter = 0;

const reducer = (state: GameState, action: GameAction): GameState => {
  const getInventoryCap = () => 200 + (state.storageLevel || 0) * 50;
  const getMaxEnergy = () => 100 + (state.energyLevel || 0) * 5;
  const getMaxHunger = () => Math.min(500, 100 + (state.hungerLevel || 0) * 25);
  const getMaxThirst = () => Math.min(500, 100 + (state.thirstLevel || 0) * 25);
  const getMaxHealth = () => Math.min(1000, 100 + (state.healthLevel || 0) * 25);

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
      let currentState = { ...state };
      const logMessages: LogMessage[] = [];
      let finalInventory = { ...currentState.inventory };
      let finalStatistics = { ...currentState.statistics };
      
      // Drone return logic is handled first
      if (currentState.droneIsActive && currentState.droneReturnTimestamp && Date.now() >= currentState.droneReturnTimestamp) {
        const currentLocation = locations[currentState.currentLocation];
        const droneBuff = 1 + (currentState.droneLevel * 0.1);
        let totalFound: Partial<Record<Resource, number>> = {};

        for(let i = 0; i < 15; i++) {
          currentLocation.resources.forEach((res) => {
              if (Math.random() < res.chance) {
                  let amount = Math.floor(Math.random() * (res.max - res.min + 1)) + res.min;
                  amount = Math.ceil(amount * droneBuff);
                  totalFound[res.resource] = (totalFound[res.resource] || 0) + amount;
              }
          });
        }
        
        let resourcesFoundText = "Drone has returned.";
        let foundSomething = false;

        for (const [resource, amount] of Object.entries(totalFound)) {
          if (amount > 0) {
            const { newInventory: updatedInventory, newStatistics: updatedStatistics } = addResource(finalInventory, finalStatistics, resource as Resource, amount);
            finalInventory = updatedInventory;
            finalStatistics = updatedStatistics;
            resourcesFoundText += ` It collected ${amount} ${itemData[resource as Resource].name}.`;
            foundSomething = true;
          }
        }
        if (!foundSomething) {
          resourcesFoundText += " It found nothing of value.";
        }

        logMessages.push({ id: generateUniqueLogId(), text: resourcesFoundText, type: 'success', timestamp: Date.now() });

        currentState = {
            ...currentState,
            inventory: finalInventory,
            statistics: finalStatistics,
            droneIsActive: false,
            droneReturnTimestamp: null,
        };
      }

      // Now continue with the rest of the tick logic, using the potentially updated state
      let newStats = { ...currentState.playerStats };
      let newInventory = { ...currentState.inventory };
      const INVENTORY_CAP = getInventoryCap();
      const MAX_ENERGY = getMaxEnergy();
      const MAX_HEALTH = getMaxHealth();
      
      // Universal passive systems (always on)
      if(currentState.builtStructures.includes('waterPurifier') && newInventory.water < INVENTORY_CAP && (currentState.gameTick % 4 === 0)) {
        newInventory.water = Math.min(INVENTORY_CAP, newInventory.water + 1);
      }
      if(currentState.builtStructures.includes('hydroponicsBay') && newInventory.apple < INVENTORY_CAP && (currentState.gameTick % 4 === 0)) {
        newInventory.apple = Math.min(INVENTORY_CAP, newInventory.apple + 1);
      }
      
      if (newStats.health <=0 ) {
          return {
            ...currentState,
            inventory: newInventory,
            log: [...logMessages, ...currentState.log]
          }
      }
      
      if (currentState.isResting || currentState.isIdle) {
        // Health regenerates while resting or idle
        if (newStats.health < MAX_HEALTH) {
            newStats.health = Math.min(MAX_HEALTH, newStats.health + 0.25);
        }
      } else {
        // Normal tick logic when not resting/idle
        newStats.thirst = Math.max(0, newStats.thirst - 0.25);
        newStats.hunger = Math.max(0, newStats.hunger - 0.25);

        if (newStats.thirst === 0 || newStats.hunger === 0) {
          // If starving or dehydrated, lose health
          newStats.health = Math.max(0, newStats.health - 2);
        }
      }

      // Universal logic (happens whether idle or not)
      if(newStats.energy < MAX_ENERGY) {
        newStats.energy = Math.min(MAX_ENERGY, newStats.energy + 0.25);
      }

      if (currentState.playerStats.health > 0 && newStats.health <= 0) {
        logMessages.push({
          id: generateUniqueLogId(),
          text: 'Your vision fades to black. The wasteland has claimed another soul.',
          timestamp: Date.now(),
          type: 'danger',
        });
        const newStatistics = { ...currentState.statistics, deaths: currentState.statistics.deaths + 1 };
        localStorage.setItem(STATS_KEY, JSON.stringify(newStatistics));
        return {
          ...currentState,
          playerStats: newStats,
          inventory: newInventory,
          statistics: newStatistics,
          log: [...logMessages, ...currentState.log],
        }
      }

      return {
        ...currentState,
        playerStats: newStats,
        inventory: newInventory,
        gameTick: currentState.gameTick + 1,
        log: [...logMessages, ...currentState.log],
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

    case 'SET_IDLE': {
      if (state.isIdle === action.payload) return state;

      // Prevent going idle if there are background tasks
      if (action.payload && (state.droneIsActive || state.smeltingQueue > 0)) {
        return state;
      }
      
      const logText = action.payload
        ? "You find a moment of peace. Your body begins to recover."
        : "You stir, the brief respite over.";
      return {
        ...state,
        isIdle: action.payload,
        log: [{ id: generateUniqueLogId(), text: logText, type: 'info', timestamp: Date.now() }, ...state.log],
      };
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
          log: [{ id: generateUniqueLogId(), text: "Not enough resources to craft this.", type: 'danger', timestamp: Date.now() }, ...state.log],
        };
      }
      
      for (const [resource, requiredAmount] of Object.entries(recipe.requirements)) {
        newInventory[resource as keyof typeof newInventory] -= requiredAmount;
      }

      // Handle map crafting as a special case for unlocking locations
      if (recipe.id === 'recipe_crudeMap') {
        const lastUnlockedIndex = locationOrder.indexOf(state.unlockedLocations[state.unlockedLocations.length - 1]);
        const nextLocationIndex = lastUnlockedIndex + 1;

        if (nextLocationIndex < locationOrder.length) {
          const nextLocationId = locationOrder[nextLocationIndex];
          const newUnlockedLocations = [...state.unlockedLocations, nextLocationId];
          const logMessageText = `You piece together a crude map, revealing the way to the ${locations[nextLocationId].name}.`;
          return {
            ...state,
            inventory: newInventory,
            unlockedLocations: newUnlockedLocations,
            log: [{ id: generateUniqueLogId(), text: logMessageText, type: 'craft', item: recipe.creates, timestamp: Date.now() }, ...state.log],
          };
        } else {
          // All locations unlocked, maybe just give the item back or a message
           return {
              ...state,
              log: [{ id: generateUniqueLogId(), text: "You've already mapped every known area.", type: 'info', timestamp: Date.now() }, ...state.log],
            };
        }
      }

      // Handle normal item crafts
      const INVENTORY_CAP = getInventoryCap();
      if(newInventory[recipe.creates] >= INVENTORY_CAP) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: `You can't carry any more ${itemData[recipe.creates].name}.`, type: 'danger', timestamp: Date.now() }, ...state.log],
        };
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

    case 'COMPLETE_QUEST': {
      const { questId } = action.payload;
      const quest = quests.find(q => q.id === questId);

      if (!quest || state.completedQuests.includes(questId)) {
        return state; // Quest not found or already completed
      }

      let newInventory = { ...state.inventory };
      let newStatistics = { ...state.statistics };

      // Check requirements
      for (const req of quest.requirements) {
        if (req.type === 'item') {
            if ((newInventory[req.item] || 0) < req.amount) {
                return {
                    ...state,
                    log: [{ id: generateUniqueLogId(), text: `You don't have the required items to help.`, type: 'danger', timestamp: Date.now() }, ...state.log],
                };
            }
        } else if (req.type === 'structure') {
            if (!state.builtStructures.includes(req.structure)) {
                 return {
                    ...state,
                    log: [{ id: generateUniqueLogId(), text: `You haven't built the required structure to complete this.`, type: 'danger', timestamp: Date.now() }, ...state.log],
                };
            }
        }
      }

      // Deduct item requirements
      for (const req of quest.requirements) {
        if (req.type === 'item') {
            newInventory[req.item] -= req.amount;
        }
      }
      
      let rewardLog = '';

      // Grant rewards
      for (const reward of quest.rewards) {
        if (reward.type === 'item') {
           const { newInventory: updatedInventory, newStatistics: updatedStatistics } = addResource(newInventory, newStatistics, reward.item, reward.amount);
            newInventory = updatedInventory;
            newStatistics = updatedStatistics;
            rewardLog += `${reward.amount} ${itemData[reward.item].name}`;
        } else if (reward.type === 'silver') {
            newInventory.silver += reward.amount;
            newStatistics.totalItemsGained.silver = (newStatistics.totalItemsGained.silver || 0) + reward.amount;
            rewardLog += `${reward.amount} Silver`;
        }
      }
      
      const newCompletedQuests = [...state.completedQuests, questId];
      
      return {
        ...state,
        inventory: newInventory,
        statistics: newStatistics,
        completedQuests: newCompletedQuests,
        log: [
            { id: generateUniqueLogId(), text: `Quest Complete: ${quest.title}`, type: 'success', timestamp: Date.now() },
            { id: generateUniqueLogId(), text: quest.completionMessage, type: 'event', timestamp: Date.now() },
             { id: generateUniqueLogId(), text: `You received: ${rewardLog}.`, type: 'success', timestamp: Date.now() }
        , ...state.log],
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
      const MAX_HEALTH = getMaxHealth();

      const newInventory = { ...state.inventory, apple: state.inventory.apple - 1 };
      const newStats = { ...state.playerStats };
      newStats.hunger = Math.min(MAX_HUNGER, newStats.hunger + 40);
      newStats.health = Math.min(MAX_HEALTH, newStats.health + 5);

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

    case 'FINISH_RESTING': {
        const newStats = { ...state.playerStats };
        const MAX_ENERGY = getMaxEnergy();
        newStats.energy = Math.min(MAX_ENERGY, newStats.energy + 10);
        return { ...state, isResting: false, playerStats: newStats };
    }
    
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
          cost = Math.floor(cost * 1.5 + 1000);
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
          cost = Math.floor(cost * 1.5 + 1000);
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
            cost = Math.floor(cost * 1.5 + 1000);
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
            cost = Math.floor(cost * 1.5 + 1000);
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
    
    case 'UPGRADE_HEALTH': {
      const calculateCost = (level: number): number => {
          if (level === 0) return 5000;
          let cost = 5000;
          for (let i = 1; i <= level; i++) {
            cost = Math.floor(cost * 1.5 + 1000);
          }
          return cost;
      };
      const cost = calculateCost(state.healthLevel);
      if (state.inventory.silver < cost) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: "Not enough silver to upgrade health.", type: 'danger', timestamp: Date.now() }, ...state.log],
        }
      }
      const newInventory = { ...state.inventory };
      newInventory.silver -= cost;
      const newHealthLevel = state.healthLevel + 1;
      const newMaxHealth = Math.min(1000, 100 + newHealthLevel * 25);
      return {
        ...state,
        inventory: newInventory,
        healthLevel: newHealthLevel,
        log: [{ id: generateUniqueLogId(), text: `Exo-Weave Plating upgraded to Level ${newHealthLevel}! New max health: ${newMaxHealth}.`, type: 'success', timestamp: Date.now() }, ...state.log],
      }
    }

    case 'UPGRADE_DRONE': {
      const cost = 10000;
      if (state.inventory.silver < cost) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: "Not enough silver to upgrade drone efficiency.", type: 'danger', timestamp: Date.now() }, ...state.log],
        }
      }
      if (state.droneLevel >= 20) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: "Drone efficiency is already at max level.", type: 'info', timestamp: Date.now() }, ...state.log],
        }
      }
      const newInventory = { ...state.inventory };
      newInventory.silver -= cost;
      const newDroneLevel = state.droneLevel + 1;
      const newBonus = newDroneLevel * 10;
      return {
        ...state,
        inventory: newInventory,
        droneLevel: newDroneLevel,
        log: [{ id: generateUniqueLogId(), text: `Drone Efficiency upgraded to Level ${newDroneLevel}! Resource yield is now +${newBonus}%.`, type: 'success', timestamp: Date.now() }, ...state.log],
      }
    }

    case 'TRAVEL': {
      const { locationId } = action.payload;
      const newLocation = locations[locationId];
      if (!newLocation || !state.unlockedLocations.includes(locationId)) return state;

      return {
        ...state,
        currentLocation: locationId,
        log: [{ id: generateUniqueLogId(), text: `You travel to the ${newLocation.name}.`, type: 'info', timestamp: Date.now() }, ...state.log],
      };
    }

    case 'SEND_DRONE': {
      if (state.inventory.apple < 10 || state.inventory.water < 10) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: "Not enough apples and water to fuel the drone.", type: 'danger', timestamp: Date.now() }, ...state.log],
        };
      }
      const newInventory = { ...state.inventory };
      newInventory.apple -= 10;
      newInventory.water -= 10;
      return {
        ...state,
        inventory: newInventory,
        droneIsActive: true,
        droneReturnTimestamp: Date.now() + 30000, // 30 seconds
        log: [{ id: generateUniqueLogId(), text: "Scavenger drone launched. It will return in 30 seconds.", type: 'info', timestamp: Date.now() }, ...state.log],
      };
    }

    case 'DRONE_RETURN': {
      // This case is now handled inside GAME_TICK to prevent race conditions.
      // Kept here to avoid breaking changes if it were ever dispatched manually, though it shouldn't be.
      return state;
    }

    case 'SET_THEME': {
      return { ...state, theme: action.payload };
    }

    default:
      return state;
  }
};

export const GameContext = createContext<{
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
  idleProgress: number;
} | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, dispatch] = useReducer(reducer, { ...initialState, statistics: initialStatistics, isInitialized: false });

  const { idleProgress, resetTimer } = useInactivityTimer({
    onIdle: () => dispatch({ type: 'SET_IDLE', payload: true }),
    onActive: () => dispatch({ type: 'SET_IDLE', payload: false }),
    timeout: 30000,
  });

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
      migratedState.isIdle = false; // Initialize idle state
      
      if (!migratedState.builtStructures) {
        migratedState.builtStructures = [];
        if (migratedState.inventory.workbench > 0) {
          migratedState.builtStructures.push('workbench');
        }
      }
      if (!migratedState.lockedItems) {
        migratedState.lockedItems = [];
      }
      if (!migratedState.unlockedFlags) {
        migratedState.unlockedFlags = [];
      }
      if (!migratedState.unlockedLocations) {
        migratedState.unlockedLocations = ['outskirts'];
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
      if (!migratedState.healthLevel) {
          migratedState.healthLevel = 0;
      }
      if (!migratedState.droneLevel) {
        migratedState.droneLevel = 0;
      }
      if (!migratedState.droneIsActive) {
        migratedState.droneIsActive = false;
      }
      if (!migratedState.droneReturnTimestamp) {
        migratedState.droneReturnTimestamp = null;
      }
      if (!migratedState.inventory.hydroponicsBay) {
        migratedState.inventory.hydroponicsBay = 0;
      }
       if (!migratedState.completedQuests) {
        migratedState.completedQuests = [];
      }
      if (!migratedState.theme) {
        migratedState.theme = 'dark';
      }
      
      // Handle active drone from a saved state
      if (migratedState.droneIsActive && migratedState.droneReturnTimestamp) {
          if (Date.now() >= migratedState.droneReturnTimestamp) {
              // If the drone should have returned already, process it immediately on load.
              // This is a simplified approach. The more robust logic is now in the game tick.
              migratedState.droneIsActive = false;
              migratedState.droneReturnTimestamp = null;
          }
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
        if (savableState.log.length > 50) {
          savableState.log = savableState.log.slice(0, 50);
        }
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
    }, 2000); // Game tick every 2 seconds

    return () => clearInterval(tickInterval);
  }, [gameState.isInitialized, gameState.playerStats.health]);
  
  useEffect(() => {
    if (gameState.isInitialized) {
      // Whenever these background tasks change, reset the inactivity timer
      if (gameState.droneIsActive || gameState.smeltingQueue > 0) {
        resetTimer();
      }
    }
  }, [gameState.isInitialized, gameState.droneIsActive, gameState.smeltingQueue, resetTimer]);


  return (
    <GameContext.Provider value={{ gameState, dispatch, idleProgress }}>
      {children}
    </GameContext.Provider>
  );
}
