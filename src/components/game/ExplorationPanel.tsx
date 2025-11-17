// src/components/game/ExplorationPanel.tsx
'use client';

import { useState } from 'react';
import { useGame } from '@/hooks/use-game';
import { getFactionEncounter } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { locations } from '@/lib/game-data/locations';
import { Loader2, Compass } from 'lucide-react';
import type { Resource } from '@/lib/game-types';
import { itemData } from '@/lib/game-data/items';
import { Skeleton } from '../ui/skeleton';

export default function ExplorationPanel() {
  const { gameState, dispatch } = useGame();
  const [isExploring, setIsExploring] = useState(false);
  const [lastEncounter, setLastEncounter] = useState<{title: string, text: string} | null>(null);

  const currentLocation = locations[gameState.currentLocation];

  const handleExplore = async () => {
    if (gameState.playerStats.energy < 10) {
        dispatch({ type: 'ADD_LOG', payload: { text: "You are too tired to explore.", type: 'danger' } });
        return;
    }

    setIsExploring(true);
    setLastEncounter(null);
    dispatch({ type: 'CONSUME', payload: { stat: 'energy', amount: 10 } });

    // Resource finding
    let foundSomething = false;
    let foundText = 'You explore the area...';
    
    setTimeout(async () => {
      currentLocation.resources.forEach((res) => {
        if (Math.random() < res.chance) {
          const amount = Math.floor(Math.random() * (res.max - res.min + 1)) + res.min;
          dispatch({ type: 'GATHER', payload: { resource: res.resource, amount } });
          foundText += ` You found ${amount} ${itemData[res.resource].name}.`;
          foundSomething = true;
        }
      });
  
      if (!foundSomething) {
        const flavor = currentLocation.flavorText[Math.floor(Math.random() * currentLocation.flavorText.length)];
        foundText += ` ${flavor}`;
      }
      
      dispatch({ type: 'ADD_LOG', payload: { text: foundText, type: 'info' } });
  
      // Faction encounter
      if (Math.random() < 0.25) {
        try {
          const result = await getFactionEncounter({
            location: currentLocation.name,
            environment: 'Gloomy and irradiated',
            factions: ['Scavengers', 'Mutants', 'Enclave Remnants'],
          });
          const encounterText = `Encounter: ${result.description}`;
          dispatch({ type: 'ADD_LOG', payload: { text: encounterText, type: 'event' } });
          setLastEncounter({ title: `Encounter with ${result.faction}`, text: result.description });
        } catch (error) {
          console.error('Failed to generate faction encounter', error);
        }
      }
  
      setIsExploring(false);
    }, 1000); // Simulate exploration time
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Explore: {currentLocation.name}</CardTitle>
        <CardDescription>{currentLocation.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button onClick={handleExplore} disabled={isExploring || gameState.playerStats.health <= 0}>
          {isExploring ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Compass className="mr-2 h-4 w-4" />
          )}
          {isExploring ? 'Exploring...' : 'Explore the Area (10 Energy)'}
        </Button>
        
        {isExploring && (
            <Card className="bg-muted/50">
                <CardHeader>
                    <Skeleton className="h-5 w-3/5" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </CardContent>
            </Card>
        )}

        {lastEncounter && !isExploring && (
            <Card className="animate-in fade-in-0 duration-500 border-accent">
                <CardHeader>
                    <CardTitle className="text-accent">{lastEncounter.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-accent-foreground/80">{lastEncounter.text}</p>
                </CardContent>
            </Card>
        )}
      </CardContent>
    </Card>
  );
}
