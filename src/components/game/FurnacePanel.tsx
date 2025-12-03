
// src/components/game/FurnacePanel.tsx
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Power, Loader2, Cpu, Layers, PackageCheck, Fuel } from 'lucide-react';
import { Progress } from '../ui/progress';
import { GameIcon } from '@/lib/icon-mapping';
import { itemData } from '@/lib/game-data/items';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '../ui/tooltip';

const SMELT_DURATION = 10; // seconds

export default function FurnacePanel() {
  const { gameState, dispatch } = useGame();
  const [componentProgress, setComponentProgress] = useState(0);
  const [ironProgress, setIronProgress] = useState(0);
  const [charcoalProgress, setCharcoalProgress] = useState(0);


  // Component requirements
  const componentSmeltRequirements = { scrap: 10, wood: 4 };
  const maxSmeltableComponents = useMemo(() => {
    const { scrap, wood } = gameState.inventory;
    return Math.floor(Math.min(scrap / componentSmeltRequirements.scrap, wood / componentSmeltRequirements.wood));
  }, [gameState.inventory]);

  // Iron Ingot requirements
  const ironSmeltRequirements = { scrap: 20, wood: 10 };
  const maxSmeltableIron = useMemo(() => {
    const { scrap, wood } = gameState.inventory;
    return Math.floor(Math.min(scrap / ironSmeltRequirements.scrap, wood / ironSmeltRequirements.wood));
  }, [gameState.inventory]);

  // Charcoal requirements
  const charcoalSmeltRequirements = { wood: 5 };
  const maxSmeltableCharcoal = useMemo(() => {
    return Math.floor(gameState.inventory.wood / charcoalSmeltRequirements.wood);
  }, [gameState.inventory.wood]);


  const isBusy = gameState.isResting;

  // Component smelting progress
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (gameState.smeltingQueue > 0 && componentProgress < 100) {
      interval = setInterval(() => {
        setComponentProgress(prev => Math.min(100, prev + (100 / SMELT_DURATION)));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.smeltingQueue, componentProgress]);

  useEffect(() => {
    if (componentProgress >= 100 && gameState.smeltingQueue > 0) {
      dispatch({ type: 'FINISH_SMELTING' });
      setComponentProgress(0); // Reset for the next item in the queue
    }
  }, [componentProgress, gameState.smeltingQueue, dispatch]);

  // Iron Ingot smelting progress
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (gameState.ironIngotSmeltingQueue > 0 && ironProgress < 100) {
      interval = setInterval(() => {
        setIronProgress(prev => Math.min(100, prev + (100 / SMELT_DURATION)));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.ironIngotSmeltingQueue, ironProgress]);

  useEffect(() => {
    if (ironProgress >= 100 && gameState.ironIngotSmeltingQueue > 0) {
      dispatch({ type: 'FINISH_SMELTING_IRON' });
      setIronProgress(0); // Reset for the next item in the queue
    }
  }, [ironProgress, gameState.ironIngotSmeltingQueue, dispatch]);

  // Charcoal smelting progress
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (gameState.charcoalSmeltingQueue > 0 && charcoalProgress < 100) {
      interval = setInterval(() => {
        setCharcoalProgress(prev => Math.min(100, prev + (100 / SMELT_DURATION)));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.charcoalSmeltingQueue, charcoalProgress]);

  useEffect(() => {
    if (charcoalProgress >= 100 && gameState.charcoalSmeltingQueue > 0) {
      dispatch({ type: 'FINISH_SMELTING_CHARCOAL' });
      setCharcoalProgress(0); // Reset for the next item in the queue
    }
  }, [charcoalProgress, gameState.charcoalSmeltingQueue, dispatch]);

  // Handler for components
  const handleSmeltComponent = () => {
    if (maxSmeltableComponents > 0) {
      dispatch({ type: 'START_SMELTING' });
      setComponentProgress(0);
    }
  };

  const handleSmeltAll = (type: 'components' | 'iron' | 'charcoal') => {
    let amount = 0;
    if (type === 'components') amount = maxSmeltableComponents;
    else if (type === 'iron') amount = maxSmeltableIron;
    else if (type === 'charcoal') amount = maxSmeltableCharcoal;

    if (amount > 0) {
      dispatch({ type: 'START_SMELTING_ALL', payload: { type, amount } });
      if (type === 'components') setComponentProgress(0);
      else if (type === 'iron') setIronProgress(0);
      else if (type === 'charcoal') setCharcoalProgress(0);
    }
  };

  const handleSmeltIron = () => {
    if (maxSmeltableIron > 0) {
      dispatch({ type: 'START_SMELTING_IRON' });
      setIronProgress(0);
    }
  };

  const handleMakeCharcoal = () => {
    if (maxSmeltableCharcoal > 0) {
      dispatch({ type: 'START_SMELTING_CHARCOAL' });
      setCharcoalProgress(0);
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Furnace</CardTitle>
        <CardDescription>Smelt raw materials into advanced components.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Card className="bg-muted/50 p-4 w-full">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-grow">
              <div className="flex items-center font-semibold text-base mb-2">
                <Cpu className="mr-2 h-5 w-5" /> Smelt Components
              </div>
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <span>Requires:</span>
                  <span className="flex items-center">
                    {resourceIcons['scrap']}
                    {itemData['scrap'].name}: {componentSmeltRequirements.scrap}
                  </span>
                  <span className="flex items-center">
                    {gameState.charcoalSmeltingQueue > 0 ? (
                      <div className="flex flex-col gap-2 mt-4">
                        <p className="text-sm text-muted-foreground text-center flex items-center justify-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Making... ({gameState.charcoalSmeltingQueue} {gameState.charcoalSmeltingQueue > 1 ? 'batches' : 'batch'} left)
                        </p>
                        <Progress value={charcoalProgress} className="w-full" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-4">
                        <Button
                          onClick={handleMakeCharcoal}
                          disabled={maxSmeltableCharcoal < 1 || isBusy || gameState.playerStats.health <= 0}
                          className="flex-1"
                          variant={maxSmeltableCharcoal > 0 ? 'default' : 'outline'}
                        >
                          <Power className="mr-2 h-4 w-4" />
                          Make
                        </Button>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex-1">
                                <Button
                                  onClick={() => handleSmeltAll('charcoal')}
                                  disabled={maxSmeltableCharcoal < 2 || isBusy || gameState.playerStats.health <= 0}
                                  className="w-full"
                                  variant="secondary"
                                >
                                  <PackageCheck className="mr-2 h-4 w-4" />
                                  Make All ({maxSmeltableCharcoal})
                                </Button>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {maxSmeltableCharcoal < 2 ? <p>You need enough resources for at least 2 items.</p> : <p>Make all possible items.</p>}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                  </Card>
                </CardContent>
              </Card>
              );
}
