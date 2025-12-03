// src/contexts/game-context.tsx
'use client';

import React, { createContext, useReducer, useEffect, type ReactNode, useState, useCallback, useRef } from 'react';
import type { GameState, GameAction, LogMessage, Resource, Item, Statistics, LocationId, Theme, Machine } from '@/lib/game-types';
import { initialState, initialStatistics } from '@/lib/game-data/initial-state';
import { recipes as allRecipes } from '@/lib/game-data/recipes';
import { itemData } from '@/lib/game-data/items';
import { locations } from '@/lib/game-data/locations';
import { useInactivityTimer } from '@/hooks/use-inactivity-timer';
import { locationOrder } from '@/lib/game-types';
import { quests } from '@/lib/game-data/quests';
import { xpCurve } from '@/lib/game-data/xp-curve';
import { useUser } from '@/hooks/use-user';
import { useFirebase } from '@/firebase/provider';
import { doc, setDoc, onSnapshot, DocumentData, writeBatch } from 'firebase/firestore';
import { machineCosts } from '@/lib/game-data/machines';
import { canUnlockSkill, skills } from '@/lib/game-data/skills';


const TICK_RATE_MS = 2000;

let logIdCounter = 0;

const addResource = (inventory: GameState['inventory'], statistics: GameState['statistics'], resource: Resource | Item, amount: number, cap: number) => {
  const newInventory = { ...inventory };
  newInventory[resource] = Math.min(cap, (newInventory[resource] || 0) + amount);

  const newStatistics = { ...statistics };
  const newTotalItemsGained = { ...newStatistics.totalItemsGained };
  newTotalItemsGained[resource] = (newTotalItemsGained[resource] || 0) + amount;
  newStatistics.totalItemsGained = newTotalItemsGained;

  return { newInventory, newStatistics };
};

const processDroneReturn = (state: GameState): { droneState: GameState, logMessage: { text: string, type: 'success' } | null } => {
  const currentLocation = locations[state.currentLocation];
  const droneBuff = 1 + (state.droneLevel * 0.1);
  const scavengersEyeLevel = state.skills?.scavengersEye || 0;
  const scavengerBuff = 1 + (scavengersEyeLevel * 0.1);

  let totalFound: Partial<Record<Resource, number>> = {};
  let finalInventory = { ...state.inventory };
  let finalStatistics = { ...state.statistics };
  const INVENTORY_CAP = 200 + (state.storageLevel || 0) * 50;

  for (let i = 0; i < 15; i++) {
    currentLocation.resources.forEach((res) => {
      if (Math.random() < res.chance) {
        let amount = Math.floor(Math.random() * (res.max - res.min + 1)) + res.min;
        amount = Math.ceil(amount * droneBuff * scavengerBuff);
        totalFound[res.resource] = (totalFound[res.resource] || 0) + amount;
      }
    });
  }

  let resourcesFoundText = "Drone has returned.";
  let foundSomething = false;

  for (const [resource, amount] of Object.entries(totalFound)) {
    if (amount > 0) {
      const { newInventory: updatedInventory, newStatistics: updatedStatistics } = addResource(finalInventory, finalStatistics, resource as Resource, amount, INVENTORY_CAP);
      finalInventory = updatedInventory;
      finalStatistics = updatedStatistics;
      resourcesFoundText += ` It collected ${amount} ${itemData[resource as Resource].name}.`;
      foundSomething = true;
    }
  }
  if (!foundSomething) {
    resourcesFoundText += " It found nothing of value.";
  }

  const droneState = {
    ...state,
    inventory: finalInventory,
    statistics: finalStatistics,
    droneIsActive: false,
    droneReturnTimestamp: null,
  };

  return { droneState, logMessage: { text: resourcesFoundText, type: 'success' } };
};

const generateUniqueLogId = () => {
  return Date.now() + logIdCounter++;
};

const xpForNextLevel = (level: number): number => {
  if (level <= 1) return xpCurve[0]; // Level 2 requirement
  if (level > xpCurve.length) return Infinity; // Max level reached
  const cumulativeXpForCurrentLevel = xpCurve[level - 2] || 0;
  const cumulativeXpForNextLevel = xpCurve[level - 1];
  return cumulativeXpForNextLevel - cumulativeXpForCurrentLevel;
}

const reducer = (state: GameState, action: GameAction): GameState => {
  const getInventoryCap = () => {
    const baseCap = 200 + (state.storageLevel || 0) * 50;
    const packMuleLevel = state.skills?.packMule || 0;
    return baseCap + (packMuleLevel * 25);
  };
  const getMaxEnergy = () => 100 + (state.energyLevel || 0) * 5;
  const getMaxHunger = () => Math.min(500, 100 + (state.hungerLevel || 0) * 25);
  const getMaxThirst = () => Math.min(500, 100 + (state.thirstLevel || 0) * 25);
  const getMaxHealth = () => Math.min(1000, 100 + (state.healthLevel || 0) * 25);


  switch (action.type) {
    case 'INITIALIZE': {
      // Merge loaded state with initial state to ensure all fields exist (handling schema updates/missing fields)
      const gameState = { ...initialState, ...action.payload.gameState };
      const statistics = { ...initialStatistics, ...action.payload.statistics };

      if (gameState.log && gameState.log.length > 0) {
        const maxId = gameState.log.reduce((max, l) => Math.max(max, l.id), 0);
        logIdCounter = (maxId > Date.now()) ? (maxId - Date.now() + 1) : 1;
      } else {
        logIdCounter = 1;
      }

      // Offline Progress Calculation
      let offlineLogMessages: LogMessage[] = [];
      let newInventory = { ...gameState.inventory };
      let newStatistics = { ...statistics };
      let newPlayerStats = { ...gameState.playerStats };
      const INVENTORY_CAP = 200 + (gameState.storageLevel || 0) * 50;
      const MAX_ENERGY = 100 + (gameState.energyLevel || 0) * 5;

      if (gameState.lastSavedTimestamp) {
        const timeDiff = Date.now() - gameState.lastSavedTimestamp;
        const ticksPassed = Math.floor(timeDiff / TICK_RATE_MS);

        if (ticksPassed > 10) { // Only calculate if away for more than ~20 seconds
          let waterGained = 0;

          if (gameState.builtStructures.includes('waterPurifier') && newInventory.water < INVENTORY_CAP) {
            // 1 water every 2 ticks
            waterGained = Math.floor(ticksPassed / 2);
            const space = INVENTORY_CAP - newInventory.water;
            waterGained = Math.min(waterGained, space);
            if (waterGained > 0) {
              const res = addResource(newInventory, newStatistics, 'water', waterGained, INVENTORY_CAP);
              newInventory = res.newInventory;
              newStatistics = res.newStatistics;
            }
          }

          // Energy Regeneration
          if (newPlayerStats.energy < MAX_ENERGY) {
            const energyRegenPerTick = 0.25;
            const energyGained = Math.min(MAX_ENERGY - newPlayerStats.energy, ticksPassed * energyRegenPerTick);

            if (energyGained > 0) {
              newPlayerStats.energy += energyGained;
              offlineLogMessages.push({
                id: generateUniqueLogId(),
                text: `You feel rested. (+${Math.floor(energyGained)} Energy)`,
                type: 'success',
                timestamp: Date.now()
              });
            }
          }

          if (waterGained > 0) {
            offlineLogMessages.push({
              id: generateUniqueLogId(),
              text: `While you were away, your Water Purifier collected ${waterGained} water.`,
              type: 'success',
              timestamp: Date.now()
            });
          }
        }
      }

      return { ...gameState, inventory: newInventory, playerStats: newPlayerStats, statistics: newStatistics, log: [...offlineLogMessages, ...gameState.log], isInitialized: true };
    }

    case 'SET_GAME_STATE': {
      const newState = { ...state, ...action.payload };

      // Prevent reverting characterName to 'Survivor' if we already have a name locally
      // This handles the race condition where a stale snapshot arrives after we've set the name
      if (state.characterName !== 'Survivor' && newState.characterName === 'Survivor') {
        newState.characterName = state.characterName;
      }

      // Ensure statistics object is always present and has totalItemsGained
      if (!newState.statistics) {
        newState.statistics = { ...initialStatistics };
      }
      if (!newState.statistics.totalItemsGained) {
        newState.statistics.totalItemsGained = { ...initialStatistics.totalItemsGained };
      }
      if (!newState.farmPlots) {
        newState.farmPlots = [];
      }
      return { ...newState, isInitialized: true };
    }

    case 'RESET_GAME': {
      localStorage.clear();
      return { ...initialState, statistics: initialStatistics, isInitialized: true };
    }

    case 'RESET_GAME_NO_LOCALSTORAGE': {
      return { ...initialState, isInitialized: false, statistics: initialStatistics };
    }

    case 'SET_CHARACTER_NAME': {
      return { ...state, characterName: action.payload };
    }

    case 'ADD_XP': {
      if (action.payload <= 0) return state;

      const fastLearnerLevel = state.skills?.fastLearner || 0;
      const xpMultiplier = 1 + (fastLearnerLevel * 0.05);
      const xpAmount = Math.floor(action.payload * xpMultiplier);

      let newXp = state.xp + xpAmount;
      let newLevel = state.level;
      let newXpToNextLevel = state.xpToNextLevel;
      let newUpgradePoints = state.upgradePoints;
      let newLog = [...state.log];

      while (newXp >= newXpToNextLevel && newLevel < 100) {
        newXp -= newXpToNextLevel;
        newLevel++;
        newUpgradePoints++;
        newXpToNextLevel = xpForNextLevel(newLevel);
        newLog.unshift({
          id: generateUniqueLogId(),
          text: `You have reached Level ${newLevel}! You gained an upgrade point.`,
          type: 'success',
          timestamp: Date.now()
        });
      }

      return {
        ...state,
        xp: newXp,
        level: newLevel,
        xpToNextLevel: newXpToNextLevel,
        upgradePoints: newUpgradePoints,
        log: newLog,
      };
    }



    case 'CLAIM_DAILY_REWARD': {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      if (now - state.lastDailyRewardClaimed < oneDay) return state;

      const INVENTORY_CAP = getInventoryCap();
      let newInventory = { ...state.inventory };
      let newStatistics = { ...state.statistics };

      // Reward: 50 Silver + Random Resource
      const silverAmount = 50;
      newInventory.silver += silverAmount;
      newStatistics.totalItemsGained.silver = (newStatistics.totalItemsGained.silver || 0) + silverAmount;

      const resources: Resource[] = ['wood', 'stone', 'scrap', 'apple', 'water'];
      const randomResource = resources[Math.floor(Math.random() * resources.length)];
      const resourceAmount = 10;

      const res = addResource(newInventory, newStatistics, randomResource, resourceAmount, INVENTORY_CAP);
      newInventory = res.newInventory;
      newStatistics = res.newStatistics;

      return {
        ...state,
        inventory: newInventory,
        statistics: newStatistics,
        lastDailyRewardClaimed: now,
        log: [{ id: generateUniqueLogId(), text: `Daily Reward Claimed: ${silverAmount} Silver and ${resourceAmount} ${itemData[randomResource].name}.`, type: 'success', timestamp: now }, ...state.log]
      };
    }

    case 'PLANT_SEED': {
      const { plotId, seed } = action.payload;
      const newInventory = { ...state.inventory };

      if (!newInventory[seed] || newInventory[seed] <= 0) return state;

      // Initialize plots if needed (should be handled in SET_GAME_STATE but safety check)
      let newPlots = [...(state.farmPlots || [])];

      // Ensure we have enough plots based on Hydroponics level or just fixed amount?
      // Let's say Hydroponics Bay gives 3 plots initially.
      // For now, let's just assume the UI handles showing valid plots and we just update the state.
      // If plot doesn't exist in array, we add it.

      const existingPlotIndex = newPlots.findIndex(p => p.id === plotId);

      // Green Thumb Skill
      const greenThumbLevel = state.skills?.greenThumb || 0;
      const growthReduction = greenThumbLevel * 0.15; // 15% per level
      const duration = 60000 * 5 * (1 - growthReduction);

      if (existingPlotIndex >= 0) {
        if (newPlots[existingPlotIndex].seed) return state; // Already planted
        newPlots[existingPlotIndex] = { ...newPlots[existingPlotIndex], seed, plantedTimestamp: Date.now(), duration };
      } else {
        newPlots.push({ id: plotId, seed, plantedTimestamp: Date.now(), duration });
      }

      newInventory[seed] -= 1;

      return {
        ...state,
        inventory: newInventory,
        farmPlots: newPlots,
        log: [{ id: generateUniqueLogId(), text: `Planted ${itemData[seed].name}.`, type: 'info', timestamp: Date.now() }, ...state.log]
      };
    }

    case 'HARVEST_CROP': {
      const { plotId } = action.payload;
      let newPlots = [...(state.farmPlots || [])];
      const plotIndex = newPlots.findIndex(p => p.id === plotId);

      if (plotIndex === -1) return state;
      const plot = newPlots[plotIndex];

      if (!plot.seed || !plot.plantedTimestamp) return state;

      const now = Date.now();
      if (now < plot.plantedTimestamp + plot.duration) return state; // Not ready

      const INVENTORY_CAP = getInventoryCap();
      let newInventory = { ...state.inventory };
      let newStatistics = { ...state.statistics };

      // Determine produce based on seed
      let produce: Resource = 'apple'; // Default
      let amount = 2; // Default yield

      if (plot.seed === 'appleSeeds') {
        produce = 'apple';
        amount = Math.floor(Math.random() * 3) + 2; // 2-4 apples
      }

      // Bountiful Harvest Skill
      const bountifulHarvestLevel = state.skills?.bountifulHarvest || 0;
      if (bountifulHarvestLevel > 0) {
        amount += 1;
      }

      // Seed Saver Skill
      const seedSaverLevel = state.skills?.seedSaver || 0;
      if (seedSaverLevel > 0 && Math.random() < 0.25) {
        const { newInventory: seedInv, newStatistics: seedStats } = addResource(newInventory, newStatistics, plot.seed, 1, INVENTORY_CAP);
        newInventory = seedInv;
        newStatistics = seedStats;
        // Log message for seed save? Maybe too spammy.
      }

      const res = addResource(newInventory, newStatistics, produce, amount, INVENTORY_CAP);
      newInventory = res.newInventory;
      newStatistics = res.newStatistics;

      // Reset plot
      newPlots[plotIndex] = { ...plot, seed: null, plantedTimestamp: null };

      const xpAmount = 5;

      let withXpState = reducer({
        ...state,
        inventory: newInventory,
        statistics: newStatistics,
        farmPlots: newPlots,
        log: [{ id: generateUniqueLogId(), text: `Harvested ${amount} ${itemData[produce].name}. (+${xpAmount} XP)`, type: 'success', timestamp: Date.now() }, ...state.log]
      }, { type: 'ADD_XP', payload: xpAmount });

      return withXpState;
    }

    case 'GAME_TICK': {
      let currentState = { ...state };
      const logMessages: LogMessage[] = [];

      // Power consumption
      const isPowered = currentState.power > 0;
      if (isPowered) {
        currentState.power = Math.max(0, currentState.power - 1);
        if (currentState.power === 0) {
          logMessages.push({ id: generateUniqueLogId(), text: "Generator out of fuel. Automated systems offline.", type: 'danger', timestamp: Date.now() });
        }
      }

      // Drone launch logic
      if (!currentState.droneIsActive && currentState.droneMissionQueue > 0 && isPowered) {
        currentState.droneMissionQueue -= 1;
        currentState.droneIsActive = true;
        currentState.droneReturnTimestamp = Date.now() + 30000;
        logMessages.push({ id: generateUniqueLogId(), text: `Generator power routed to Drone Bay. Launching drone... ${currentState.droneMissionQueue} missions left in queue.`, type: 'info', timestamp: Date.now() });
      }

      // Drone return logic
      if (currentState.droneIsActive && currentState.droneReturnTimestamp && Date.now() >= currentState.droneReturnTimestamp) {
        const { droneState, logMessage } = processDroneReturn(currentState);
        currentState = droneState;
        if (logMessage) {
          logMessages.push({ id: generateUniqueLogId(), ...logMessage, timestamp: Date.now() });
        }
      }

      // Machine processing logic
      // Step 1: Calculate power grid and consume fuel
      let totalPowerCapacity = 0;
      let totalPowerConsumption = 0;

      // First pass: consume fuel and calculate power
      const updatedMachines = currentState.machines.map(machine => {
        if (machine.type === 'biomassBurner') {
          // Consume 1 fuel per tick if running
          if (machine.fuelLevel > 0) {
            const newFuelLevel = machine.fuelLevel - 1;
            if (newFuelLevel <= 0) {
              return { ...machine, fuelLevel: 0, status: 'no_fuel' as const };
            }
            return { ...machine, fuelLevel: newFuelLevel, status: 'running' as const };
          }
          return { ...machine, status: 'no_fuel' as const };
        }
        return machine;
      });

      // Calculate power after fuel consumption
      updatedMachines.forEach(machine => {
        if (machine.type === 'biomassBurner' && machine.status === 'running') {
          totalPowerCapacity += 10; // Each burner provides 10 power
        } else if (machine.type !== 'biomassBurner') {
          let consumption = 5;
          // Power Saver Skill
          if ((currentState.skills?.powerSaver || 0) > 0) {
            consumption = 4; // 20% reduction
          }
          totalPowerConsumption += consumption;
        }
      });

      const gridEfficiency = totalPowerCapacity > 0 ? Math.min(1, totalPowerCapacity / totalPowerConsumption) : 0;

      // Step 2: Process machines (production logic)
      const finalMachines = updatedMachines.map(machine => {
        if (machine.type === 'biomassBurner') {
          return machine; // Already handled
        }

        // Check if machine has power
        if (gridEfficiency < 0.5) {
          return { ...machine, status: 'no_power' as const };
        }

        const machineData = machineCosts[machine.type];
        if (!machineData.processingSpeed || !machineData.recipe) {
          return { ...machine, status: 'idle' as const };
        }

        // Check if output buffer is full
        const largerBuffersLevel = currentState.skills?.largerBuffers || 0;
        const bufferCap = largerBuffersLevel >= 2 ? 20 : largerBuffersLevel >= 1 ? 15 : 10;

        const outputFull = machineData.recipe.output && Object.entries(machineData.recipe.output).some(
          ([resource, amount]) => (machine.outputBuffer[resource as Resource] || 0) + amount > bufferCap
        );
        if (outputFull) {
          return { ...machine, status: 'output_full' as const };
        }

        // Check if input buffer has required resources (for Smelter/Constructor)
        if (machineData.recipe.input) {
          const hasInput = Object.entries(machineData.recipe.input).every(
            ([resource, amount]) => (machine.inputBuffer[resource as Resource] || 0) >= amount
          );
          if (!hasInput) {
            return { ...machine, status: 'input_starved' as const, processingProgress: 0 };
          }
        }

        // Process item
        const machineEfficiencyLevel = currentState.skills?.machineEfficiency || 0;
        const speedMultiplier = 1 + (machineEfficiencyLevel * 0.05);
        const newProgress = machine.processingProgress + (1 * speedMultiplier);
        if (newProgress >= machineData.processingSpeed) {
          // Production complete!
          const newInputBuffer = { ...machine.inputBuffer };
          const newOutputBuffer = { ...machine.outputBuffer };

          // Consume input
          if (machineData.recipe.input) {
            Object.entries(machineData.recipe.input).forEach(([resource, amount]) => {
              newInputBuffer[resource as Resource] = (newInputBuffer[resource as Resource] || 0) - amount;
            });
          }

          // Produce output
          Object.entries(machineData.recipe.output).forEach(([resource, amount]) => {
            newOutputBuffer[resource as Resource] = (newOutputBuffer[resource as Resource] || 0) + amount;
          });

          return {
            ...machine,
            inputBuffer: newInputBuffer,
            outputBuffer: newOutputBuffer,
            processingProgress: 0,
            status: 'running' as const,
          };
        }

        // Still processing
        return { ...machine, processingProgress: newProgress, status: 'running' as const };
      });

      currentState = { ...currentState, machines: finalMachines, powerCapacity: totalPowerCapacity, powerConsumption: totalPowerConsumption };

      let newStats = { ...currentState.playerStats };
      let newInventory = { ...currentState.inventory };
      const INVENTORY_CAP = getInventoryCap();
      const MAX_ENERGY = getMaxEnergy();

      // Universal passive systems (always on)
      if (currentState.builtStructures.includes('waterPurifier') && newInventory.water < INVENTORY_CAP && (currentState.gameTick % 2 === 0)) {
        newInventory.water = Math.min(INVENTORY_CAP, newInventory.water + 1);
      }
      // Removed passive apple generation from Hydroponics Bay
      // if (currentState.builtStructures.includes('hydroponicsBay') && newInventory.apple < INVENTORY_CAP && (currentState.gameTick % 2 === 0)) {
      //   newInventory.apple = Math.min(INVENTORY_CAP, newInventory.apple + 1);
      // }

      if (newStats.health <= 0) {
        return {
          ...currentState,
          inventory: newInventory,
          log: [...logMessages, ...currentState.log]
        }
      }

      if (currentState.isResting || currentState.isIdle) {
        const MAX_HEALTH = getMaxHealth();
        if (newStats.health < MAX_HEALTH) {
          const secondWindLevel = currentState.skills?.secondWind || 0;
          const healAmount = 0.25 * (1 + (secondWindLevel * 0.5));
          newStats.health = Math.min(MAX_HEALTH, newStats.health + healAmount);
        }
      } else {
        const efficientMetabolismLevel = currentState.skills?.efficientMetabolism || 0;
        const drainMultiplier = 1 - (efficientMetabolismLevel * 0.1);
        const drainAmount = 0.25 * drainMultiplier;

        newStats.thirst = Math.max(0, newStats.thirst - drainAmount);
        newStats.hunger = Math.max(0, newStats.hunger - drainAmount);

        if (newStats.thirst === 0 || newStats.hunger === 0) {
          newStats.health = Math.max(0, newStats.health - 2);
        }
      }

      if (newStats.energy < MAX_ENERGY) {
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
      const INVENTORY_CAP = getInventoryCap();

      if (encounter.type === 'positive' && encounter.reward) {
        const { item, amount } = encounter.reward;
        const scavengersEyeLevel = state.skills?.scavengersEye || 0;
        const scavengerBuff = 1 + (scavengersEyeLevel * 0.1);
        const finalAmount = Math.ceil(amount * scavengerBuff);

        const { newInventory: updatedInventory, newStatistics: updatedStatistics } = addResource(newInventory, newStatistics, item, finalAmount, INVENTORY_CAP);
        newInventory = updatedInventory;
        newStatistics = updatedStatistics;
        logText += ` You found ${finalAmount} ${itemData[item].name}.`;
      }

      if (encounter.type === 'negative' && encounter.penalty) {
        const { type: penaltyType, amount } = encounter.penalty;
        if (penaltyType === 'health') {
          newStats.health = Math.max(0, newStats.health - amount);
          logText += ` You lost ${amount} health.`;
        } else if (penaltyType === 'stoneAxe') {
          if (newEquipment.hand === 'stoneAxe') {
            newEquipment.hand = null;
          } else {
            return state;
          }
        }
        else {
          const currentAmount = newInventory[penaltyType] || 0;
          const amountLost = Math.min(currentAmount, amount);
          if (amountLost > 0) {
            newInventory[penaltyType] = currentAmount - amountLost;
            logText += ` You lost ${amountLost} ${itemData[penaltyType].name}.`;
          } else {
            // This case should not be reached if exploration panel filters correctly
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

      if (action.payload && (state.droneIsActive || state.smeltingQueue > 0 || state.ironIngotSmeltingQueue > 0 || state.charcoalSmeltingQueue > 0)) {
        return state;
      }

      const logText = action.payload
        ? "You find a moment of peace. Your body begins to recover."
        : "You stir, the brief respite is over.";
      return {
        ...state,
        isIdle: action.payload,
        log: [{ id: generateUniqueLogId(), text: logText, type: 'info', timestamp: Date.now() }, ...state.log],
      };
    }

    case 'GATHER': {
      const { resource, amount } = action.payload;
      const INVENTORY_CAP = getInventoryCap();
      const { newInventory, newStatistics } = addResource(state.inventory, state.statistics, resource, amount, INVENTORY_CAP);
      return { ...state, inventory: newInventory, statistics: newStatistics };
    }

    case 'BUILD_STRUCTURE': {
      const recipe = allRecipes.find((r) => r.id === action.payload.recipeId);
      if (!recipe) return state;
      const INVENTORY_CAP = getInventoryCap();

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
      allRecipes.forEach(r => {
        if (r.unlockedBy.includes(recipe.creates as Item) && !newUnlockedRecipes.includes(r.id)) {
          newUnlockedRecipes.push(r.id);
        }
      });

      const itemDetails = itemData[recipe.creates as Item];
      const xpAmount = 50;
      const logMessageText = `You built a ${itemDetails.name}. (+${xpAmount} XP)\n${itemDetails.description}`;
      const { newStatistics } = addResource(state.inventory, state.statistics, recipe.creates as Item, 1, INVENTORY_CAP);

      let withXpState = reducer({
        ...state,
        inventory: newInventory,
        builtStructures: newBuiltStructures,
        unlockedRecipes: newUnlockedRecipes,
        statistics: newStatistics,
        log: [{ id: generateUniqueLogId(), text: logMessageText, type: 'craft', item: recipe.creates as Item, timestamp: Date.now() }, ...state.log],
      }, { type: 'ADD_XP', payload: xpAmount });

      return withXpState;
    }

    case 'CRAFT': {
      const currentMapCostMultiplier = Math.max(1, state.unlockedLocations.length - 1);
      const recipes = allRecipes.map(recipe => {
        if (recipe.id === 'recipe_crudeMap') {
          const newReqs: Partial<Record<Resource | 'silver', number>> = {};
          for (const [resource, amount] of Object.entries(recipe.requirements)) {
            if (resource === 'silver') {
              newReqs.silver = Math.floor(amount * Math.pow(currentMapCostMultiplier, 1.2));
            } else {
              newReqs[resource as Resource] = Math.floor(amount * Math.pow(currentMapCostMultiplier, 1.5));
            }
          }
          return { ...recipe, requirements: newReqs };
        }
        return recipe;
      });

      const recipe = recipes.find((r) => r.id === action.payload.recipeId);
      if (!recipe) return state;

      const newInventory = { ...state.inventory };
      let canCraft = true;
      const INVENTORY_CAP = getInventoryCap();

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

      if (recipe.creates === 'crudeMap') {
        const lastUnlockedIndex = locationOrder.indexOf(state.unlockedLocations[state.unlockedLocations.length - 1]);
        const nextLocationIndex = lastUnlockedIndex + 1;

        if (nextLocationIndex < locationOrder.length) {
          const nextLocationId = locationOrder[nextLocationIndex];
          const newUnlockedLocations = [...state.unlockedLocations, nextLocationId];
          const xpAmount = 100;
          const logMessageText = `You piece together a crude map, revealing the way to the ${locations[nextLocationId].name}. (+${xpAmount} XP)`;

          const { newInventory: finalInventory, newStatistics } = addResource(newInventory, state.statistics, recipe.creates, 1, INVENTORY_CAP);

          let withXpState = reducer({
            ...state,
            inventory: finalInventory,
            statistics: newStatistics,
            unlockedLocations: newUnlockedLocations,
            log: [{ id: generateUniqueLogId(), text: logMessageText, type: 'craft', item: recipe.creates, timestamp: Date.now() }, ...state.log],
          }, { type: 'ADD_XP', payload: xpAmount });

          return withXpState;
        } else {
          return {
            ...state,
            log: [{ id: generateUniqueLogId(), text: "You've already mapped every known area.", type: 'info', timestamp: Date.now() }, ...state.log],
          };
        }
      }

      if (newInventory[recipe.creates] >= INVENTORY_CAP) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: `You can't carry any more ${itemData[recipe.creates].name}.`, type: 'danger', timestamp: Date.now() }, ...state.log],
        };
      }

      const { newInventory: finalInventory, newStatistics } = addResource(newInventory, state.statistics, recipe.creates, 1, INVENTORY_CAP);

      // Track crafted item
      if (!newStatistics.itemsCrafted) newStatistics.itemsCrafted = {};
      newStatistics.itemsCrafted[recipe.creates] = (newStatistics.itemsCrafted[recipe.creates] || 0) + 1;

      const newUnlockedRecipes = [...state.unlockedRecipes];
      recipes.forEach(r => {
        if (r.unlockedBy.includes(recipe.creates as Item) && !newUnlockedRecipes.includes(r.id)) {
          newUnlockedRecipes.push(r.id);
        }
      });

      const itemDetails = itemData[recipe.creates];
      const xpAmount = 10;
      const logMessageText = `Crafted ${itemDetails.name}. (+${xpAmount} XP)\n${itemDetails.description}`;

      let withXpState = reducer({
        ...state,
        inventory: finalInventory,
        statistics: newStatistics,
        unlockedRecipes: newUnlockedRecipes,
        log: [{ id: generateUniqueLogId(), text: logMessageText, type: 'craft', item: recipe.creates, timestamp: Date.now() }, ...state.log],
      }, { type: 'ADD_XP', payload: xpAmount });
      return withXpState;
    }

    case 'CRAFT_ALL': {
      const { recipeId, amount } = action.payload;
      const recipe = allRecipes.find((r) => r.id === recipeId);
      if (!recipe || amount <= 0) return state;

      const newInventory = { ...state.inventory };
      const INVENTORY_CAP = getInventoryCap();
      let totalCost: Partial<Record<Resource, number>> = {};

      for (const [resource, requiredAmount] of Object.entries(recipe.requirements)) {
        totalCost[resource as Resource] = requiredAmount * amount;
      }

      for (const [resource, cost] of Object.entries(totalCost)) {
        if ((newInventory[resource as Resource] || 0) < cost) {
          return state; // Should not happen if button is disabled correctly
        }
        newInventory[resource as Resource] -= cost;
      }

      const { newInventory: finalInventory, newStatistics } = addResource(newInventory, state.statistics, recipe.creates, amount, INVENTORY_CAP);

      // Track crafted items
      if (!newStatistics.itemsCrafted) newStatistics.itemsCrafted = {};
      newStatistics.itemsCrafted[recipe.creates] = (newStatistics.itemsCrafted[recipe.creates] || 0) + amount;

      const itemDetails = itemData[recipe.creates];
      const xpAmount = 10 * amount;
      const logMessageText = `Batch crafted ${amount} x ${itemDetails.name}. (+${xpAmount} XP)`;

      let withXpState = reducer({
        ...state,
        inventory: finalInventory,
        statistics: newStatistics,
        log: [{ id: generateUniqueLogId(), text: logMessageText, type: 'craft', item: recipe.creates, timestamp: Date.now() }, ...state.log],
      }, { type: 'ADD_XP', payload: xpAmount });

      return withXpState;
    }


    case 'COMPLETE_QUEST': {
      const { questId } = action.payload;
      const quest = quests.find(q => q.id === questId);
      const INVENTORY_CAP = getInventoryCap();

      if (!quest || state.completedQuests.includes(questId)) {
        return state;
      }

      let newInventory = { ...state.inventory };
      let newStatistics = { ...state.statistics };

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

      for (const req of quest.requirements) {
        if (req.type === 'item') {
          newInventory[req.item] -= req.amount;
        }
      }

      let rewardLog = '';
      let newState = { ...state };
      let xpGained = 100;

      for (const reward of quest.rewards) {
        if (reward.type === 'item') {
          if (reward.item === 'crudeMap') {
            const lastUnlockedIndex = locationOrder.indexOf(newState.unlockedLocations[newState.unlockedLocations.length - 1]);
            const nextLocationIndex = lastUnlockedIndex + 1;
            if (nextLocationIndex < locationOrder.length) {
              const nextLocationId = locationOrder[nextLocationIndex];
              newState.unlockedLocations = [...newState.unlockedLocations, nextLocationId];
            }
          } else {
            const { newInventory: updatedInventory, newStatistics: updatedStatistics } = addResource(newInventory, newStatistics, reward.item, reward.amount, INVENTORY_CAP);
            newInventory = updatedInventory;
            newStatistics = updatedStatistics;
          }
          rewardLog += `${reward.amount} ${itemData[reward.item].name}`;
        } else if (reward.type === 'silver') {
          newInventory.silver += reward.amount;
          newStatistics.totalItemsGained.silver = (newStatistics.totalItemsGained.silver || 0) + reward.amount;
          rewardLog += `${reward.amount} Silver`;
        }
      }

      const newCompletedQuests = [...state.completedQuests, questId];

      // Unlock lore entries associated with this quest
      const loreEntries = require('@/lib/game-data/lore').loreEntries;
      const newUnlockedLore = [...state.unlockedLore];
      loreEntries.forEach((entry: any) => {
        if (entry.unlockedBy === questId && !newUnlockedLore.includes(entry.id)) {
          newUnlockedLore.push(entry.id);
        }
      });

      // Grant reputation with NPC (determine NPC from quest ID prefix)
      const npcReputation = { ...state.npcReputation };
      const npcId = questId.split('_')[1]; // Extract NPC ID from quest ID (e.g., 'quest_silas_1' -> 'silas')
      type ValidNPC = 'silas' | 'kael' | 'elara' | 'anya' | 'marcus' | 'vera' | 'rook' | 'chen';
      const validNPCs: ValidNPC[] = ['silas', 'kael', 'elara', 'anya', 'marcus', 'vera', 'rook', 'chen'];
      if (npcId && validNPCs.includes(npcId as ValidNPC)) {
        const typedNpcId = npcId as ValidNPC;
        npcReputation[typedNpcId] = (npcReputation[typedNpcId] || 0) + 10; // +10 reputation per quest
      }

      let finalState = reducer({
        ...newState,
        inventory: newInventory,
        statistics: newStatistics,
        completedQuests: newCompletedQuests,
        unlockedLore: newUnlockedLore,
        npcReputation,
        log: [
          { id: generateUniqueLogId(), text: `Quest Complete: ${quest.title} (+${xpGained} XP)`, type: 'success', timestamp: Date.now() },
          { id: generateUniqueLogId(), text: quest.completionMessage, type: 'event', timestamp: Date.now() },
          { id: generateUniqueLogId(), text: `You received: ${rewardLog}.`, type: 'success', timestamp: Date.now() }
          , ...state.log],
      }, { type: 'ADD_XP', payload: xpGained });

      return finalState;
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

      const silverTongueLevel = state.skills?.silverTongue || 0;
      const priceMultiplier = 1 + (silverTongueLevel * 0.1);
      const silverEarned = Math.floor(amount * price * priceMultiplier);
      newInventory[item] -= amount;
      newInventory.silver += silverEarned;

      const newTotalItemsGained = { ...newStatistics.totalItemsGained };
      newTotalItemsGained.silver = (newTotalItemsGained.silver || 0) + silverEarned;
      newStatistics = { ...newStatistics, totalItemsGained: newTotalItemsGained };


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
          const silverTongueLevel = state.skills?.silverTongue || 0;
          const priceMultiplier = 1 + (silverTongueLevel * 0.1);
          const silverGained = Math.floor(quantity * itemInfo.sellPrice * priceMultiplier);
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
      newStatistics = { ...newStatistics, totalItemsGained: newTotalItemsGained };


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
        newLockedItems.splice(itemIndex, 1);
      } else {
        newLockedItems.push(item);
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
        return state;
      }

      newStats[stat] = Math.max(0, newStats[stat] - amount);
      return { ...state, playerStats: newStats, inventory: newInventory };
    }

    case 'PENALTY': {
      const { stat, percentage } = action.payload;
      const newStats = { ...state.playerStats };
      const currentStatValue = newStats[stat];
      const reduction = currentStatValue * (percentage / 100);
      newStats[stat] = Math.max(0, currentStatValue - reduction);
      return { ...state, playerStats: newStats };
    }

    case 'REGEN_ENERGY': {
      const { amount } = action.payload;
      const newStats = { ...state.playerStats };
      const MAX_ENERGY = getMaxEnergy();
      newStats.energy = Math.min(MAX_ENERGY, newStats.energy + amount);
      return { ...state, playerStats: newStats };
    }

    case 'EAT': {
      if (state.inventory.apple <= 0) return state;
      const MAX_HUNGER = getMaxHunger();
      const MAX_HEALTH = getMaxHealth();

      const newInventory = { ...state.inventory, apple: state.inventory.apple - 1 };
      const newStats = { ...state.playerStats };
      newStats.hunger = Math.min(MAX_HUNGER, newStats.hunger + 40);
      newStats.health = Math.min(MAX_HEALTH, newStats.health + 5);
      newStats.energy = Math.min(getMaxEnergy(), newStats.energy + 1);

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
      if (state.inventory[item] < 1) return state;

      const newInventory = { ...state.inventory };
      const newEquipment = { ...state.equipment };

      const currentItem = newEquipment[slot];
      if (currentItem) {
        newInventory[currentItem] += 1;
      }

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
      const newInventory = { ...state.inventory };
      const totalScrapNeeded = 10;
      const totalWoodNeeded = 4;

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
        smeltingQueue: state.smeltingQueue + 1,
        log: [{ id: generateUniqueLogId(), text: `The furnace roars to life...`, type: 'info', timestamp: Date.now() }, ...state.log],
      };
    }

    case 'FINISH_SMELTING': {
      if (state.smeltingQueue <= 0) return state;
      const INVENTORY_CAP = getInventoryCap();

      let { newInventory, newStatistics } = addResource(state.inventory, state.statistics, 'components', 1, INVENTORY_CAP);

      const newSmeltingQueue = state.smeltingQueue - 1;

      let logMessage = `The furnace cools. You retrieve 1 Component.\n${itemData['components'].description}`;
      if (newSmeltingQueue === 0) {
        logMessage += "\nThe component queue is empty.";
      }

      return {
        ...state,
        inventory: newInventory,
        statistics: newStatistics,
        smeltingQueue: newSmeltingQueue,
        log: [{ id: generateUniqueLogId(), text: logMessage, type: 'craft', item: 'components', timestamp: Date.now() }, ...state.log],
      };
    }

    case 'START_SMELTING_ALL': {
      const { type, amount } = action.payload;
      if (amount <= 0) return state;

      const newInventory = { ...state.inventory };
      let logText = '';

      if (type === 'components') {
        const totalScrapNeeded = 10 * amount;
        const totalWoodNeeded = 4 * amount;
        if (newInventory.scrap < totalScrapNeeded || newInventory.wood < totalWoodNeeded) return state;
        newInventory.scrap -= totalScrapNeeded;
        newInventory.wood -= totalWoodNeeded;
        logText = `Queued ${amount} components for smelting.`;
        return { ...state, inventory: newInventory, smeltingQueue: state.smeltingQueue + amount, log: [{ id: generateUniqueLogId(), text: logText, type: 'info', timestamp: Date.now() }, ...state.log] }
      } else if (type === 'iron') {
        const totalScrapNeeded = 20 * amount;
        const totalWoodNeeded = 10 * amount;
        if (newInventory.scrap < totalScrapNeeded || newInventory.wood < totalWoodNeeded) return state;
        newInventory.scrap -= totalScrapNeeded;
        newInventory.wood -= totalWoodNeeded;
        logText = `Queued ${amount} iron ingots for smelting.`;
        return { ...state, inventory: newInventory, ironIngotSmeltingQueue: state.ironIngotSmeltingQueue + amount, log: [{ id: generateUniqueLogId(), text: logText, type: 'info', timestamp: Date.now() }, ...state.log] }
      } else if (type === 'charcoal') {
        const totalWoodNeeded = 5 * amount;
        if (newInventory.wood < totalWoodNeeded) return state;
        newInventory.wood -= totalWoodNeeded;
        logText = `Queued ${amount} charcoal for making.`;
        return { ...state, inventory: newInventory, charcoalSmeltingQueue: state.charcoalSmeltingQueue + amount, log: [{ id: generateUniqueLogId(), text: logText, type: 'info', timestamp: Date.now() }, ...state.log] }
      }
      return state;
    }

    case 'START_SMELTING_IRON': {
      const newInventory = { ...state.inventory };
      const totalScrapNeeded = 20;
      const totalWoodNeeded = 10;

      if (newInventory.scrap < totalScrapNeeded || newInventory.wood < totalWoodNeeded) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: "Not enough resources to smelt iron ingots.", type: 'danger', timestamp: Date.now() }, ...state.log],
        };
      }

      newInventory.scrap -= totalScrapNeeded;
      newInventory.wood -= totalWoodNeeded;

      return {
        ...state,
        inventory: newInventory,
        ironIngotSmeltingQueue: state.ironIngotSmeltingQueue + 1,
        log: [{ id: generateUniqueLogId(), text: `The furnace burns hotter...`, type: 'info', timestamp: Date.now() }, ...state.log],
      };
    }

    case 'FINISH_SMELTING_IRON': {
      if (state.ironIngotSmeltingQueue <= 0) return state;
      const INVENTORY_CAP = getInventoryCap();

      let { newInventory, newStatistics } = addResource(state.inventory, state.statistics, 'ironIngot', 1, INVENTORY_CAP);

      const newSmeltingQueue = state.ironIngotSmeltingQueue - 1;

      let logMessage = `You pull a glowing Iron Ingot from the furnace.\n${itemData['ironIngot'].description}`;
      if (newSmeltingQueue === 0) {
        logMessage += "\nThe iron ingot queue is empty.";
      }

      return {
        ...state,
        inventory: newInventory,
        statistics: newStatistics,
        ironIngotSmeltingQueue: newSmeltingQueue,
        log: [{ id: generateUniqueLogId(), text: logMessage, type: 'craft', item: 'ironIngot', timestamp: Date.now() }, ...state.log],
      };
    }

    case 'START_SMELTING_CHARCOAL': {
      const newInventory = { ...state.inventory };
      const totalWoodNeeded = 5;

      if (newInventory.wood < totalWoodNeeded) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: "Not enough wood to make charcoal.", type: 'danger', timestamp: Date.now() }, ...state.log],
        };
      }

      newInventory.wood -= totalWoodNeeded;

      return {
        ...state,
        inventory: newInventory,
        charcoalSmeltingQueue: state.charcoalSmeltingQueue + 1,
        log: [{ id: generateUniqueLogId(), text: `The furnace begins to smolder...`, type: 'info', timestamp: Date.now() }, ...state.log],
      };
    }

    case 'FINISH_SMELTING_CHARCOAL': {
      if (state.charcoalSmeltingQueue <= 0) return state;
      const INVENTORY_CAP = getInventoryCap();

      let { newInventory, newStatistics } = addResource(state.inventory, state.statistics, 'charcoal', 1, INVENTORY_CAP);

      const newSmeltingQueue = state.charcoalSmeltingQueue - 1;

      let logMessage = `You retrieve a block of charcoal.\n${itemData['charcoal'].description}`;
      if (newSmeltingQueue === 0) {
        logMessage += "\nThe charcoal queue is empty.";
      }

      return {
        ...state,
        inventory: newInventory,
        statistics: newStatistics,
        charcoalSmeltingQueue: newSmeltingQueue,
        log: [{ id: generateUniqueLogId(), text: logMessage, type: 'craft', item: 'charcoal', timestamp: Date.now() }, ...state.log],
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

    case 'QUEUE_DRONE_MISSIONS': {
      const { amount } = action.payload;
      if (state.droneMissionQueue + amount > 10) {
        return { ...state, log: [{ id: generateUniqueLogId(), text: "Drone mission queue is full.", type: 'danger', timestamp: Date.now() }, ...state.log] };
      }
      const appleCost = 10 * amount;
      const waterCost = 10 * amount;
      if (state.inventory.apple < appleCost || state.inventory.water < waterCost) {
        return { ...state, log: [{ id: generateUniqueLogId(), text: "Not enough resources to queue missions.", type: 'danger', timestamp: Date.now() }, ...state.log] };
      }
      const newInventory = { ...state.inventory };
      newInventory.apple -= appleCost;
      newInventory.water -= waterCost;
      return {
        ...state,
        inventory: newInventory,
        droneMissionQueue: state.droneMissionQueue + amount,
        log: [{ id: generateUniqueLogId(), text: `Queued ${amount} drone mission(s).`, type: 'info', timestamp: Date.now() }, ...state.log],
      };
    }

    case 'ADD_FUEL': {
      const { fuelType } = action.payload;
      const newInventory = { ...state.inventory };
      let powerToAdd = 0;
      let logText = "";

      if (fuelType === 'wood' && newInventory.wood > 0) {
        newInventory.wood -= 1;
        powerToAdd = 10;
        logText = `You add some wood to the generator. (+${powerToAdd} Power)`;
      } else if (fuelType === 'biomass' && newInventory.biomass > 0) {
        newInventory.biomass -= 1;
        powerToAdd = 250;
        logText = `You feed biomass into the generator. (+${powerToAdd} Power)`;
      } else if (fuelType === 'charcoal' && newInventory.charcoal > 0) {
        newInventory.charcoal -= 1;
        powerToAdd = 50;
        logText = `You add charcoal to the generator. (+${powerToAdd} Power)`;
      } else {
        return { ...state, log: [{ id: generateUniqueLogId(), text: `No ${fuelType} to add.`, type: 'danger', timestamp: Date.now() }, ...state.log] };
      }

      const newPower = Math.min(1000, state.power + powerToAdd);
      return {
        ...state,
        inventory: newInventory,
        power: newPower,
        log: [{ id: generateUniqueLogId(), text: logText, type: 'success', timestamp: Date.now() }, ...state.log],
      }
    }

    case 'SET_THEME': {
      return { ...state, theme: action.payload };
    }

    case 'CLAIM_MASTERY_REWARD': {
      const { itemId, tier } = action.payload;
      const crafts = state.statistics.itemsCrafted?.[itemId as Resource | Item] || 0;
      const requiredCrafts = Math.pow(10, tier);

      if (crafts < requiredCrafts) return state;

      const currentClaimedTier = state.masteryClaimed?.[itemId as Resource | Item] || 0;
      if (tier <= currentClaimedTier) return state; // Already claimed

      // Reward: Silver and XP
      // Tier 1 (10 crafts): 100 Silver, 50 XP
      // Tier 2 (100 crafts): 500 Silver, 250 XP
      // Tier 3 (1000 crafts): 2500 Silver, 1000 XP
      // Formula: Silver = 100 * 5^(tier-1), XP = 50 * 5^(tier-1)

      const masteryAdeptLevel = state.skills?.masteryAdept || 0;
      const rewardMultiplier = 1 + (masteryAdeptLevel * 0.25);

      const silverReward = Math.floor(100 * Math.pow(5, tier - 1) * rewardMultiplier);
      const xpReward = Math.floor(50 * Math.pow(5, tier - 1) * rewardMultiplier);

      const INVENTORY_CAP = getInventoryCap();
      let newInventory = { ...state.inventory };
      let newStatistics = { ...state.statistics };

      // Add Silver
      newInventory.silver += silverReward;
      newStatistics.totalItemsGained.silver = (newStatistics.totalItemsGained.silver || 0) + silverReward;

      const newMasteryClaimed = { ...state.masteryClaimed, [itemId]: tier };

      let newState = {
        ...state,
        inventory: newInventory,
        statistics: newStatistics,
        masteryClaimed: newMasteryClaimed,
        log: [{
          id: generateUniqueLogId(),
          text: `Mastery Tier ${tier} claimed for ${itemData[itemId as Resource | Item]?.name || itemId}! (+${silverReward} Silver, +${xpReward} XP)`,
          type: 'success' as const,
          timestamp: Date.now()
        }, ...state.log]
      };

      // Add XP
      return reducer(newState, { type: 'ADD_XP', payload: xpReward });
    }

    case 'CHEAT_ADD_SILVER': {
      const newInventory = { ...state.inventory };
      newInventory.silver += 10000;
      return { ...state, inventory: newInventory };
    }

    case 'BUILD_MACHINE': {
      const { type } = action.payload;
      const machineData = machineCosts[type];

      // Check unlock conditions
      const isUnlocked = machineData.unlockedBy.every(req => state.builtStructures.includes(req));
      if (!isUnlocked) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: `You need to build ${machineData.unlockedBy.join(', ')} first.`, type: 'danger' as const, timestamp: Date.now() }, ...state.log]
        };
      }

      // Check resource costs
      const newInventory = { ...state.inventory };
      for (const [resource, amount] of Object.entries(machineData.cost)) {
        if ((newInventory[resource as Resource] || 0) < amount) {
          return {
            ...state,
            log: [{ id: generateUniqueLogId(), text: `Not enough resources to build ${machineData.name}.`, type: 'danger' as const, timestamp: Date.now() }, ...state.log]
          };
        }
      }

      // Deduct costs
      for (const [resource, amount] of Object.entries(machineData.cost)) {
        newInventory[resource as Resource] -= amount;
      }

      const newMachine: Machine = {
        id: `machine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        recipeId: null,
        status: type === 'biomassBurner' ? 'no_fuel' as const : 'idle' as const,
        inputBuffer: {},
        outputBuffer: {},
        targetNodeId: null,
        connectedOutput: null,
        fuelLevel: 0,
        processingProgress: 0,
      };

      return {
        ...state,
        inventory: newInventory,
        machines: [...state.machines, newMachine],
        log: [{ id: generateUniqueLogId(), text: `Built ${machineData.name}.`, type: 'success' as const, timestamp: Date.now() }, ...state.log]
      };
    }

    case 'UNLOCK_SKILL': {
      const { skillId } = action.payload;
      const { canUnlock, reason } = canUnlockSkill(state.skills, skillId, state.upgradePoints, state.builtStructures);

      if (!canUnlock) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: `Cannot unlock skill: ${reason}`, type: 'danger' as const, timestamp: Date.now() }, ...state.log]
        };
      }

      const skill = skills.find(s => s.id === skillId);
      if (!skill) return state;

      const newUpgradePoints = state.upgradePoints - skill.cost;
      const currentLevel = state.skills[skillId] || 0;
      const newSkills = { ...state.skills, [skillId]: currentLevel + 1 };

      return {
        ...state,
        upgradePoints: newUpgradePoints,
        skills: newSkills,
        log: [{ id: generateUniqueLogId(), text: `Unlocked skill: ${skill.name} (Level ${currentLevel + 1})`, type: 'success' as const, timestamp: Date.now() }, ...state.log]
      };
    }

    case 'CONFIGURE_MACHINE': {
      const { machineId, recipeId } = action.payload;
      const updatedMachines = state.machines.map(m =>
        m.id === machineId ? { ...m, recipeId, status: 'idle' as const } : m
      );
      return {
        ...state,
        machines: updatedMachines,
        log: [{ id: generateUniqueLogId(), text: `Machine configured.`, type: 'info' as const, timestamp: Date.now() }, ...state.log]
      };
    }

    case 'CONNECT_MACHINES': {
      const { sourceId, targetId } = action.payload;
      const updatedMachines = state.machines.map(m =>
        m.id === sourceId ? { ...m, connectedOutput: targetId } : m
      );
      return {
        ...state,
        machines: updatedMachines,
        log: [{ id: generateUniqueLogId(), text: `Machines connected.`, type: 'info' as const, timestamp: Date.now() }, ...state.log]
      };
    }

    case 'ADD_MACHINE_FUEL': {
      const { machineId, fuelType } = action.payload;
      const machine = state.machines.find(m => m.id === machineId);

      if (!machine || machine.type !== 'biomassBurner') return state;

      const newInventory = { ...state.inventory };
      const fuelValue = fuelType === 'biomass' ? 100 : fuelType === 'charcoal' ? 50 : fuelType === 'wood' ? 10 : 0;

      if (!newInventory[fuelType] || newInventory[fuelType] <= 0) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: `No ${fuelType} available.`, type: 'danger' as const, timestamp: Date.now() }, ...state.log]
        };
      }

      newInventory[fuelType] -= 1;
      const updatedMachines = state.machines.map(m =>
        m.id === machineId ? { ...m, fuelLevel: m.fuelLevel + fuelValue, status: 'running' as const } : m
      );

      return {
        ...state,
        inventory: newInventory,
        machines: updatedMachines,
        log: [{ id: generateUniqueLogId(), text: `Added ${fuelType} to burner (+${fuelValue} fuel).`, type: 'success' as const, timestamp: Date.now() }, ...state.log]
      };
    }

    case 'TRANSFER_TO_MACHINE': {
      const { machineId, resource, amount } = action.payload;
      const machine = state.machines.find(m => m.id === machineId);

      if (!machine) return state;

      const newInventory = { ...state.inventory };
      const available = newInventory[resource] || 0;

      if (available < amount) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: `Not enough ${itemData[resource].name}.`, type: 'danger' as const, timestamp: Date.now() }, ...state.log]
        };
      }

      const currentInBuffer = machine.inputBuffer[resource] || 0;
      const largerBuffersLevel = state.skills?.largerBuffers || 0;
      const bufferCap = largerBuffersLevel >= 2 ? 20 : largerBuffersLevel >= 1 ? 15 : 10;

      if (currentInBuffer + amount > bufferCap) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: `Input buffer full.`, type: 'danger' as const, timestamp: Date.now() }, ...state.log]
        };
      }

      newInventory[resource] -= amount;
      const updatedMachines = state.machines.map(m =>
        m.id === machineId ? { ...m, inputBuffer: { ...m.inputBuffer, [resource]: currentInBuffer + amount } } : m
      );

      return {
        ...state,
        inventory: newInventory,
        machines: updatedMachines,
      };
    }

    case 'FISH': {
      const { zoneId } = action.payload;
      const { getFishingZoneById, rollFishingLoot } = require('@/lib/game-data/fishing');
      const zone = getFishingZoneById(zoneId);

      if (!zone) return state;

      // Check level requirement
      if (state.level < zone.levelRequirement) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: `You need to be level ${zone.levelRequirement} to fish here.`, type: 'danger', timestamp: Date.now() }, ...state.log]
        };
      }

      // Check energy
      const MAX_ENERGY = getMaxEnergy();
      if (state.playerStats.energy < zone.energyCost) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: `Not enough energy. Need ${zone.energyCost} energy.`, type: 'danger', timestamp: Date.now() }, ...state.log]
        };
      }

      // Roll for loot
      const loot = rollFishingLoot(zone.lootTable);

      let newInventory = { ...state.inventory };
      let newCaughtFish = { ...state.caughtFish };
      let newStatistics = { ...state.statistics };
      let logMessage = '';

      // Handle the catch
      if (loot.isFish) {
        // It's a fish - add to caught fish inventory
        newCaughtFish[loot.item as string] = (newCaughtFish[loot.item as string] || 0) + 1;
        logMessage = `You caught a ${loot.item}! (${loot.rarity})`;
      } else {
        // It's a resource/item - add to inventory
        const INVENTORY_CAP = getInventoryCap();
        const { newInventory: updatedInventory, newStatistics: updatedStatistics } = addResource(newInventory, newStatistics, loot.item as any, 1, INVENTORY_CAP);
        newInventory = updatedInventory;
        newStatistics = updatedStatistics;
        const itemName = (loot.item in itemData) ? itemData[loot.item as keyof typeof itemData]?.name : loot.item;
        logMessage = `You found ${itemName}! (${loot.rarity})`;
      }

      // Consume energy
      const newPlayerStats = {
        ...state.playerStats,
        energy: state.playerStats.energy - zone.energyCost
      };

      return {
        ...state,
        playerStats: newPlayerStats,
        inventory: newInventory,
        caughtFish: newCaughtFish,
        statistics: newStatistics,
        log: [{ id: generateUniqueLogId(), text: logMessage, type: 'success', timestamp: Date.now() }, ...state.log]
      };
    }

    case 'SELL_ALL_FISH': {
      const { fishingZones } = require('@/lib/game-data/fishing');
      let totalSilver = 0;
      let fishSold = 0;

      // Calculate total value of all caught fish
      const allLoot: any[] = [];
      fishingZones.forEach((zone: any) => {
        allLoot.push(...zone.lootTable);
      });

      const newCaughtFish = { ...state.caughtFish };

      Object.entries(newCaughtFish).forEach(([fishType, count]) => {
        if (count && count > 0) {
          const fishData = allLoot.find((loot: any) => loot.item === fishType && loot.isFish);
          if (fishData && fishData.silverValue) {
            totalSilver += fishData.silverValue * count;
            fishSold += count;
            delete newCaughtFish[fishType];
          }
        }
      });

      if (fishSold === 0) {
        return {
          ...state,
          log: [{ id: generateUniqueLogId(), text: `You have no fish to sell.`, type: 'danger', timestamp: Date.now() }, ...state.log]
        };
      }

      const newInventory = { ...state.inventory };
      newInventory.silver += totalSilver;

      const newStatistics = { ...state.statistics };
      newStatistics.totalItemsGained.silver = (newStatistics.totalItemsGained.silver || 0) + totalSilver;

      return {
        ...state,
        inventory: newInventory,
        caughtFish: newCaughtFish,
        statistics: newStatistics,
        log: [{ id: generateUniqueLogId(), text: `Sold ${fishSold} fish for ${totalSilver} silver!`, type: 'success', timestamp: Date.now() }, ...state.log]
      };
    }

    case 'SET_FISHING_ZONE': {
      const { zoneId } = action.payload;
      return {
        ...state,
        currentFishingZone: zoneId
      };
    }
  }
  return state;
};

export const GameContext = createContext<{
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
  idleProgress: number;
} | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, dispatch] = useReducer(reducer, { ...initialState, statistics: initialStatistics, isInitialized: false });
  const { user } = useUser();
  const { firestore } = useFirebase();
  const isSavingRef = useRef(false);

  const isFirstLoad = useRef(true);

  const { idleProgress, resetTimer } = useInactivityTimer({
    onIdle: () => dispatch({ type: 'SET_IDLE', payload: true }),
    onActive: () => dispatch({ type: 'SET_IDLE', payload: false }),
    timeout: 37000,
  });

  // Effect for loading game state from Firestore
  useEffect(() => {
    if (user) {
      const userDocRef = doc(firestore, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as GameState;
          if (isFirstLoad.current) {
            isFirstLoad.current = false;
            // Separate statistics from gameState for INITIALIZE payload
            const { statistics, ...restGameState } = data;
            dispatch({
              type: 'INITIALIZE',
              payload: {
                gameState: restGameState as Omit<GameState, 'statistics'>,
                statistics: statistics || initialStatistics
              }
            });
          } else if (!isSavingRef.current) {
            dispatch({ type: 'SET_GAME_STATE', payload: data });
          }
        } else {
          // New user, create initial state in Firestore
          const batch = writeBatch(firestore);
          const newGameData = {
            ...initialState,
            isInitialized: true,
          };
          batch.set(userDocRef, newGameData);
          batch.commit();
          dispatch({ type: 'SET_GAME_STATE', payload: newGameData });
        }
      });

      return () => unsubscribe();
    } else {
      dispatch({ type: 'RESET_GAME_NO_LOCALSTORAGE' });
    }
  }, [user, firestore]);

  // Effect for saving game state to Firestore
  useEffect(() => {
    if (gameState.isInitialized && user && gameState.lastSavedTimestamp && Date.now() - gameState.lastSavedTimestamp > 2000) {
      isSavingRef.current = true;
      const docRef = doc(firestore, 'users', user.uid);
      const { isInitialized, ...savableState } = gameState;

      // Remove undefined values to prevent Firestore errors
      const cleanState = JSON.parse(JSON.stringify({ ...savableState, lastSavedTimestamp: Date.now() }));

      setDoc(docRef, cleanState, { merge: true }).finally(() => {
        isSavingRef.current = false;
      });
    }
  }, [gameState, user, firestore]);


  // Effect for game tick
  useEffect(() => {
    if (!gameState.isInitialized || gameState.playerStats.health <= 0) return;

    const tickInterval = setInterval(() => {
      dispatch({ type: 'GAME_TICK' });
    }, TICK_RATE_MS);

    return () => clearInterval(tickInterval);
  }, [gameState.isInitialized, gameState.playerStats.health]);

  // Effect for inactivity timer
  useEffect(() => {
    if (gameState.isInitialized) {
      if (gameState.droneIsActive || gameState.smeltingQueue > 0 || gameState.ironIngotSmeltingQueue > 0 || gameState.charcoalSmeltingQueue > 0) {
        resetTimer();
      }
    }
  }, [gameState.isInitialized, gameState.droneIsActive, gameState.smeltingQueue, gameState.ironIngotSmeltingQueue, gameState.charcoalSmeltingQueue, resetTimer]);


  return (
    <GameContext.Provider value={{ gameState, dispatch, idleProgress }}>
      {children}
    </GameContext.Provider>
  );
}
