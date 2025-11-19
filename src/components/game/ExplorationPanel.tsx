// src/components/game/ExplorationPanel.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { locations } from '@/lib/game-data/locations';
import { Loader2, Compass, Search, Bed, Map, Apple } from 'lucide-react';
import { itemData } from '@/lib/game-data/items';
import { Progress } from '../ui/progress';
import { positiveEncounters, negativeEncounters } from '@/lib/game-data/encounters';
import type { FixedEncounter } from '@/lib/game-data/encounters';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { LocationId } from '@/lib/game-types';
import DronePanel from './DronePanel';

export default function ExplorationPanel() {
  const { gameState, dispatch } = useGame();
  const [isExploring, setIsExploring] = useState(false);
  const [isScavenging, setIsScavenging] = useState(false);
  const [restingProgress, setRestingProgress] = useState(0);

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
        setRestingProgress(prev => prev + (100 / 37));
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
    let encounter: FixedEncounter;
    if (Math.random() < 0.5) { // 50% chance for a positive encounter
      encounter = positiveEncounters[Math.floor(Math.random() * positiveEncounters.length)];
    } else {
      encounter = negativeEncounters[Math.floor(Math.random() * negativeEncounters.length)];
    }
    dispatch({ type: 'TRIGGER_ENCOUNTER', payload: encounter });
  };


  const handleExplore = async () => {
    if (gameState.playerStats.energy < 10) {
        dispatch({ type: 'ADD_LOG', payload: { text: "You are too tired to explore.", type: 'danger' } });
        return;
    }

    setIsExploring(true);
    dispatch({ type: 'TRACK_STAT', payload: { stat: 'timesExplored' } });
    dispatch({ type: 'CONSUME', payload: { stat: 'energy', amount: 10 } });

    setTimeout(() => {
        // Decide if an encounter or resource finding happens.
        if (Math.random() < 0.25) { // 25% chance of a fixed encounter
            handleFixedEncounter();
        } else {
            // No encounter, proceed with resource finding
            let foundSomething = false;
            let foundText = 'You explore the area...';
            let foundScrapThisTurn = false;

            currentLocation.resources.forEach((res) => {
                if (Math.random() < res.chance) {
                    let amount = Math.floor(Math.random() * (res.max - res.min + 1)) + res.min;
                    
                    // Apply bonuses from equipped items
                    if (res.resource === 'wood' && equipment.hand === 'stoneAxe') {
                        amount = Math.ceil(amount * 1.50); // 50% bonus
                    }
                    if (res.resource === 'scrap') {
                        foundScrapThisTurn = true;
                        if(equipment.hand === 'metalDetector') {
                            amount = Math.ceil(amount * 1.20); // 20% bonus
                        }
                    }

                    dispatch({ type: 'GATHER', payload: { resource: res.resource, amount } });
                    foundText += ` You found ${amount} ${itemData[res.resource].name}.`;
                    foundSomething = true;
                }
            });
            
            // Metal detector guarantees at least 1 scrap if none was found via normal roll
            if (equipment.hand === 'metalDetector' && !foundScrapThisTurn && currentLocation.resources.some(r => r.resource === 'scrap')) {
                const amount = 1;
                dispatch({ type: 'GATHER', payload: { resource: 'scrap', amount } });
                foundText += ` Your metal detector chirps, leading you to ${amount} ${itemData['scrap'].name}.`;
                foundSomething = true;
            }
        
            if (!foundSomething) {
                const flavor = currentLocation.flavorText[Math.floor(Math.random() * currentLocation.flavorText.length)];
                foundText += ` ${flavor}`;
            }

            dispatch({ type: 'ADD_LOG', payload: { text: foundText, type: 'info' } });
        }
        
        setIsExploring(false);
    }, 1000); // Simulate exploration time
  };

  const handleScavenge = async () => {
    if (gameState.playerStats.energy < 5) {
        dispatch({ type: 'ADD_LOG', payload: { text: "You are too tired to scavenge.", type: 'danger' } });
        return;
    }

    setIsScavenging(true);
    dispatch({ type: 'TRACK_STAT', payload: { stat: 'timesScavenged' } });
    dispatch({ type: 'CONSUME', payload: { stat: 'energy', amount: 5 } });

    setTimeout(() => {
        let foundApple = false;
        let scavengeText = "You search nearby ruins for supplies...";

        // Always find water
        const waterAmount = 1;
        dispatch({ type: 'GATHER', payload: { resource: 'water', amount: waterAmount } });
        scavengeText += ` You found ${waterAmount} ${itemData['water'].name}.`;

        // Chance to find an apple
        if (Math.random() < 0.3) {
            const appleAmount = 1;
            dispatch({ type: 'GATHER', payload: { resource: 'apple', amount: appleAmount } });
            scavengeText += ` You found ${appleAmount} ${itemData['apple'].name}.`;
            foundApple = true;
        }

        if (!foundApple) {
             // This part of the message might be redundant if we always find water,
             // but we can adjust the text to reflect what was found.
             // For now, let's keep it simple.
        }

        dispatch({ type: 'ADD_LOG', payload: { text: scavengeText, type: 'info' } });
        setIsScavenging(false);
    }, 800);
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
  
  const handleEat = () => {
    if (inventory.apple > 0) {
      dispatch({ type: 'EAT' });
    }
  };

  const handleTravel = (locationId: LocationId) => {
    dispatch({ type: 'TRAVEL', payload: { locationId } });
  }
  
  const isBusy = isExploring || isScavenging || gameState.isResting || gameState.smeltingQueue > 0 || gameState.droneIsActive;
  const isDead = gameState.playerStats.health <= 0;
  
  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle>Explore: {currentLocation.name}</CardTitle>
        <CardDescription>{currentLocation.description}</CardDescription>
         {inventory.apple > 0 && (
            <Button 
                size="icon" 
                variant={inventory.apple > 0 ? "default" : "outline"}
                onClick={handleEat} 
                disabled={isDead || inventory.apple === 0 || isBusy} 
                aria-label={`Eat apple (${inventory.apple})`}
                className="absolute top-4 right-4"
            >
                <Apple className="h-4 w-4" />
            </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {gameState.builtStructures.includes('droneBay') && <DronePanel />}
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
              {gameState.isResting ? 'Resting...' : 'Rest'}
            </Button>
        </div>
        <div className="flex items-center gap-2">
            {unlockedLocations.length > 1 && (
            <Dialog>
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

        {gameState.isResting && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground text-center">Recovering energy...</p>
            <Progress value={restingProgress} className="w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
