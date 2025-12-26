
// src/components/game/ExplorationPanel.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { locations } from '@/lib/game-data/locations';
import { Loader2, Compass, Search, Bed, Map, Zap } from 'lucide-react';
import { itemData } from '@/lib/game-data/items';
import { Progress } from '../ui/progress';
import { encounters } from '@/lib/game-data/encounters';
import type { FixedEncounter } from '@/lib/game-data/encounters';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { LocationId, Resource } from '@/lib/game-types';
import DronePanel from './DronePanel';
import { cn } from '@/lib/utils';

const REST_DURATION_SECONDS = 10;

export default function ExplorationPanel() {
  const { gameState, dispatch } = useGame();
  const [isExploring, setIsExploring] = useState(false);
  const [isScavenging, setIsScavenging] = useState(false);
  const [restingProgress, setRestingProgress] = useState(0);
  const [exploreProgress, setExploreProgress] = useState(0);
  const [scavengeProgress, setScavengeProgress] = useState(0);
  const [isTravelDialogOpen, setIsTravelDialogOpen] = useState(false);

  const EXPLORE_DURATION = 1500;
  const SCAVENGE_DURATION = 1000;


  const currentLocation = locations[gameState.currentLocation];
  const { equipment, unlockedLocations, inventory } = gameState;

  const finishResting = useCallback(() => {
    dispatch({ type: 'FINISH_RESTING' });
    dispatch({ type: 'ADD_LOG', payload: { text: "You feel rested and ready for action.", type: 'success' } });
    setRestingProgress(0);
  }, [dispatch]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (gameState.isResting) {
      interval = setInterval(() => {
        setRestingProgress(prev => prev + (100 / REST_DURATION_SECONDS));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.isResting]);

  useEffect(() => {
    if (restingProgress >= 100) {
      finishResting();
    }
  }, [restingProgress, finishResting]);

  const handleFixedEncounter = () => {
    const locationEncounters = encounters[gameState.currentLocation];
    if (!locationEncounters) return; // Should not happen

    if (Math.random() < 0.5) { // 50% chance for a positive encounter
      const encounter = locationEncounters.positive[Math.floor(Math.random() * locationEncounters.positive.length)];
      dispatch({ type: 'TRIGGER_ENCOUNTER', payload: encounter });
    } else { // 50% chance for a negative encounter
      // Filter for negative encounters where the player actually has the item to lose
      const validNegativeEncounters = locationEncounters.negative.filter(enc => {
        if (enc.penalty.type === 'health' || enc.penalty.type === 'stoneAxe') return true;
        return inventory[enc.penalty.type as Resource] > 0;
      });

      if (validNegativeEncounters.length > 0) {
        const encounter = validNegativeEncounters[Math.floor(Math.random() * validNegativeEncounters.length)];
        dispatch({ type: 'TRIGGER_ENCOUNTER', payload: encounter });
      } else {
        // Fallback if no valid negative encounter can be triggered
        const flavor = currentLocation.flavorText[Math.floor(Math.random() * currentLocation.flavorText.length)];
        dispatch({ type: 'ADD_LOG', payload: { text: `You explore the area... ${flavor}`, type: 'info' } });
      }
    }
  };


  const handleExplore = async () => {
    if (gameState.playerStats.energy < 10) {
      dispatch({ type: 'ADD_LOG', payload: { text: "You are too tired to explore.", type: 'danger' } });
      return;
    }

    setIsExploring(true);
    setExploreProgress(0);
    dispatch({ type: 'TRACK_STAT', payload: { stat: 'timesExplored' } });
    dispatch({ type: 'CONSUME', payload: { stat: 'energy', amount: 10 } });

    const interval = setInterval(() => {
      setExploreProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (100 / (EXPLORE_DURATION / 100));
      });
    }, 100);

    setTimeout(() => {
      // Decide if an encounter or resource finding happens.
      if (Math.random() < 0.25) { // 25% chance of a fixed encounter
        handleFixedEncounter();
      } else {
        // No encounter, proceed with resource finding
        let foundSomething = false;
        let foundText = 'You explore the area...';
        let foundScrapThisTurn = false;
        let xpGained = 0;

        currentLocation.resources.forEach((res) => {
          if (Math.random() < res.chance) {
            let amount = Math.floor(Math.random() * (res.max - res.min + 1)) + res.min;

            // Apply exploration efficiency upgrade
            const explorationEffLevel = gameState.explorationEfficiencyLevel || 0;
            if (explorationEffLevel > 0) {
              amount = Math.ceil(amount * (1 + (explorationEffLevel * 0.15))); // 15% per level
            }

            // Scavenger's Eye Skill
            const scavengersEyeLevel = gameState.skills?.scavengersEye || 0;
            if (scavengersEyeLevel > 0) {
              amount = Math.ceil(amount * (1 + (scavengersEyeLevel * 0.10))); // 10% per level
            }

            // Apply bonuses from equipped items
            if (res.resource === 'wood' && equipment.hand === 'stoneAxe') {
              amount = Math.ceil(amount * 1.50); // 50% bonus
            }
            if (res.resource === 'scrap') {
              foundScrapThisTurn = true;
              if (equipment.hand === 'metalDetector') {
                amount = Math.ceil(amount * 1.20); // 20% bonus
              }
            }

            dispatch({ type: 'GATHER', payload: { resource: res.resource, amount } });
            foundText += ` You found ${amount} ${itemData[res.resource].name}.`;
            foundSomething = true;
            xpGained += 5; // Gain 5 XP for each resource type found
          }
        });

        // Metal detector guarantees at least 1 scrap if none was found via normal roll
        if (equipment.hand === 'metalDetector' && !foundScrapThisTurn && currentLocation.resources.some(r => r.resource === 'scrap')) {
          const amount = 1;
          dispatch({ type: 'GATHER', payload: { resource: 'scrap', amount } });
          foundText += ` Your metal detector chirps, leading you to ${amount} ${itemData['scrap'].name}.`;
          foundSomething = true;
          xpGained += 5;
        }

        if (!foundSomething) {
          const flavor = currentLocation.flavorText[Math.floor(Math.random() * currentLocation.flavorText.length)];
          foundText += ` ${flavor}`;
        } else {
          dispatch({ type: 'ADD_XP', payload: xpGained });
          foundText += ` (+${xpGained} XP)`;
        }

        dispatch({ type: 'ADD_LOG', payload: { text: foundText, type: 'info' } });
      }

      setIsExploring(false);
      setExploreProgress(0);
    }, EXPLORE_DURATION);
  };

  const handleScavenge = async () => {
    if (gameState.playerStats.energy < 5) {
      dispatch({ type: 'ADD_LOG', payload: { text: "You are too tired to scavenge.", type: 'danger' } });
      return;
    }

    setIsScavenging(true);
    setScavengeProgress(0);
    dispatch({ type: 'TRACK_STAT', payload: { stat: 'timesScavenged' } });
    dispatch({ type: 'CONSUME', payload: { stat: 'energy', amount: 5 } });

    const interval = setInterval(() => {
      setScavengeProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (100 / (SCAVENGE_DURATION / 100));
      });
    }, 100);

    setTimeout(() => {
      let foundSomething = false;
      let scavengeText = "You search nearby ruins for supplies...";

      // Always find water
      const waterAmount = 1;
      dispatch({ type: 'GATHER', payload: { resource: 'water', amount: waterAmount } });
      scavengeText += ` You found ${waterAmount} ${itemData['water'].name}.`;
      foundSomething = true;

      if (gameState.currentLocation === 'forest') {
        // In the forest, find bananas and peaches
        if (Math.random() < 0.3) {
          const bananaAmount = 1;
          dispatch({ type: 'GATHER', payload: { resource: 'banana', amount: bananaAmount } });
          scavengeText += ` You found ${bananaAmount} ${itemData['banana'].name}.`;
          foundSomething = true;
        }
        if (Math.random() < 0.15) {
          const peachAmount = 1;
          dispatch({ type: 'GATHER', payload: { resource: 'peach', amount: peachAmount } });
          scavengeText += ` You found ${peachAmount} ${itemData['peach'].name}.`;
          foundSomething = true;
        }
      } else {
        // Elsewhere, find apples
        if (Math.random() < 0.3) {
          const appleAmount = 1;
          dispatch({ type: 'GATHER', payload: { resource: 'apple', amount: appleAmount } });
          scavengeText += ` You found ${appleAmount} ${itemData['apple'].name}.`;
          foundSomething = true;
        }
      }

      if (!foundSomething) {
        scavengeText += " But you find nothing else of use.";
      }

      dispatch({ type: 'ADD_LOG', payload: { text: scavengeText, type: 'info' } });
      setIsScavenging(false);
      setScavengeProgress(0);
    }, SCAVENGE_DURATION);
  };

  const handleRest = () => {
    if (gameState.playerStats.energy >= 100) {
      dispatch({ type: 'ADD_LOG', payload: { text: "You are already fully rested.", type: 'info' } });
      return;
    }
    dispatch({ type: 'START_RESTING' });
    setRestingProgress(0);
    dispatch({ type: 'ADD_LOG', payload: { text: "You find a relatively safe spot to rest your eyes for a moment...", type: 'info' } });
  };

  const handleEatCookedApple = () => {
    if (inventory.cookedApple > 0) {
      dispatch({ type: 'EAT_COOKED_APPLE' });
    }
  };

  const handleTravel = (locationId: LocationId) => {
    dispatch({ type: 'TRAVEL', payload: { locationId } });
    setIsTravelDialogOpen(false);
  }

  const isBusy = isExploring || isScavenging || gameState.isResting;
  const isDead = gameState.playerStats.health <= 0;

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle>Explore: {currentLocation.name}</CardTitle>
        <CardDescription>{currentLocation.description}</CardDescription>
        {inventory.cookedApple > 0 && (
          <Button
            size="icon"
            variant={inventory.cookedApple > 0 ? "default" : "outline"}
            onClick={handleEatCookedApple}
            disabled={isDead || inventory.cookedApple === 0 || isBusy}
            aria-label={`Eat cooked apple (${inventory.cookedApple})`}
            className={cn("absolute top-4 right-4 h-8 w-8 sm:h-10 sm:w-10")}
          >
            <Zap className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {gameState.builtStructures.includes('droneBay') && <DronePanel mode="explore" />}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button onClick={handleExplore} disabled={isBusy || isDead} className="flex-1">
            {isExploring ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Compass className="mr-2 h-4 w-4" />
            )}
            {isExploring ? 'Exploring...' : 'Explore (10 Energy)'}
          </Button>
          <Button variant="secondary" onClick={handleScavenge} disabled={isBusy || isDead} className="flex-1">
            {isScavenging ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            {isScavenging ? 'Scavenging...' : 'Scavenge (5 Energy)'}
          </Button>
          <Button variant="outline" onClick={handleRest} disabled={isBusy || isDead} className="flex-1">
            {gameState.isResting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Bed className="mr-2 h-4 w-4" />
            )}
            {gameState.isResting ? 'Resting...' : 'Rest (+15 Energy)'}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {unlockedLocations.length > 1 && (
            <Dialog open={isTravelDialogOpen} onOpenChange={setIsTravelDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={isBusy || isDead} className="w-full">
                  <Map className="mr-2 h-4 w-4" /> Travel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Travel to a new location</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                  {unlockedLocations.map(locationId => {
                    const location = locations[locationId];
                    return (
                      <Button
                        key={location.id}
                        variant={currentLocation.id === location.id ? 'default' : 'secondary'}
                        onClick={() => handleTravel(location.id)}
                        disabled={currentLocation.id === location.id}
                      >
                        {location.name}
                      </Button>
                    )
                  })}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isExploring && (
          <div className="flex flex-col gap-2">
            <Progress value={exploreProgress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center font-mono">Trekking through waste... {Math.floor(exploreProgress)}%</p>
          </div>
        )}

        {isScavenging && (
          <div className="flex flex-col gap-2">
            <Progress value={scavengeProgress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center font-mono italic">Sifting through debris... {Math.floor(scavengeProgress)}%</p>
          </div>
        )}

        {gameState.isResting && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground text-center">Resting... {Math.floor(restingProgress)}%</p>
            <Progress value={restingProgress} className="w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

