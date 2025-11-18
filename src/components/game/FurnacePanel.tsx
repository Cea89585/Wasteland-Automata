// src/components/game/FurnacePanel.tsx
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Power, Loader2, Cpu, PackageCheck } from 'lucide-react';
import { Progress } from '../ui/progress';
import { resourceIcons } from './GameIcons';
import { itemData } from '@/lib/game-data/items';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const SMELT_DURATION = 10; // seconds

export default function FurnacePanel() {
  const { gameState, dispatch } = useGame();
  const [progress, setProgress] = useState(0);

  const smeltRequirements = { scrap: 10, wood: 4 };

  const maxSmeltable = useMemo(() => {
    const { scrap, wood } = gameState.inventory;
    return Math.floor(Math.min(scrap / smeltRequirements.scrap, wood / smeltRequirements.wood));
  }, [gameState.inventory]);

  const canSmelt = maxSmeltable >= 1;
  const isBusy = gameState.isResting;

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (gameState.smeltingQueue > 0 && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => Math.min(100, prev + (100 / SMELT_DURATION)));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.smeltingQueue, progress]);

  useEffect(() => {
    if (progress >= 100 && gameState.smeltingQueue > 0) {
      dispatch({ type: 'FINISH_SMELTING' });
      setProgress(0); // Reset for the next item in the queue
    }
  }, [progress, gameState.smeltingQueue, dispatch]);

  const handleSmelt = () => {
    if (!canSmelt) {
      dispatch({ type: 'ADD_LOG', payload: { text: "Not enough resources to smelt components.", type: 'danger' } });
      return;
    }
    dispatch({ type: 'START_SMELTING', payload: { amount: 1 } });
    setProgress(0);
  };

  const handleSmeltAll = () => {
    if (maxSmeltable > 0) {
      dispatch({ type: 'START_SMELTING', payload: { amount: maxSmeltable } });
      setProgress(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Furnace</CardTitle>
        <CardDescription>Smelt raw materials into advanced components.</CardDescription>
      </CardHeader>
      <CardContent>
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
                            {itemData['scrap'].name}: {smeltRequirements.scrap}
                        </span>
                        <span className="flex items-center">
                            {resourceIcons['wood']}
                            {itemData['wood'].name}: {smeltRequirements.wood}
                        </span>
                    </div>
                     <div className="flex flex-wrap gap-x-4 gap-y-2">
                        <span>Creates:</span>
                        <span className="flex items-center">
                            {resourceIcons['components']}
                            {itemData['components'].name}: 1
                        </span>
                    </div>
                  </div>
              </div>
            </div>
             {gameState.smeltingQueue > 0 ? (
                <div className="flex flex-col gap-2 mt-4">
                    <p className="text-sm text-muted-foreground text-center flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Smelting... ({gameState.smeltingQueue} {gameState.smeltingQueue > 1 ? 'batches' : 'batch'} left)
                    </p>
                    <Progress value={progress} className="w-full" />
                </div>
            ) : (
                <TooltipProvider>
                  <div className="flex justify-center items-center gap-2 mt-4">
                      <Button 
                          onClick={handleSmelt} 
                          disabled={!canSmelt || isBusy || gameState.playerStats.health <= 0}
                          className="flex-1"
                          variant={canSmelt ? 'default' : 'outline'}
                      >
                          <Power className="mr-2 h-4 w-4" />
                          Smelt
                      </Button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                              onClick={handleSmeltAll} 
                              disabled={maxSmeltable < 2 || isBusy || gameState.playerStats.health <= 0}
                              className="flex-1"
                              variant="secondary"
                          >
                              <PackageCheck className="mr-2 h-4 w-4" />
                              Smelt All ({maxSmeltable})
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {maxSmeltable < 2 ? <p>You need enough resources for at least 2 batches.</p> : <p>Queue all possible smelting jobs.</p>}
                        </TooltipContent>
                      </Tooltip>
                  </div>
                </TooltipProvider>
            )}
          </Card>
      </CardContent>
    </Card>
  );
}