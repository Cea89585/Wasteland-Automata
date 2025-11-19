// src/components/game/FurnacePanel.tsx
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Power, Loader2, Cpu, Layers } from 'lucide-react';
import { Progress } from '../ui/progress';
import { resourceIcons } from './GameIcons';
import { itemData } from '@/lib/game-data/items';
import { Separator } from '../ui/separator';

const SMELT_DURATION = 10; // seconds

export default function FurnacePanel() {
  const { gameState, dispatch } = useGame();
  const [componentProgress, setComponentProgress] = useState(0);
  const [ironProgress, setIronProgress] = useState(0);

  // Component requirements
  const componentSmeltRequirements = { scrap: 10, wood: 4 };
  const canSmeltComponent = useMemo(() => {
    const { scrap, wood } = gameState.inventory;
    return scrap >= componentSmeltRequirements.scrap && wood >= componentSmeltRequirements.wood;
  }, [gameState.inventory]);
  
  // Iron Ingot requirements
  const ironSmeltRequirements = { scrap: 20, wood: 10 };
  const canSmeltIron = useMemo(() => {
    const { scrap, wood } = gameState.inventory;
    return scrap >= ironSmeltRequirements.scrap && wood >= ironSmeltRequirements.wood;
  }, [gameState.inventory]);

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

  // Handler for components
  const handleSmeltComponent = () => {
    if (canSmeltComponent) {
      dispatch({ type: 'START_SMELTING'});
      setComponentProgress(0);
    }
  };

  // Handler for iron
  const handleSmeltIron = () => {
    if (canSmeltIron) {
      dispatch({ type: 'START_SMELTING_IRON'});
      setIronProgress(0);
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
                            {resourceIcons['wood']}
                            {itemData['wood'].name}: {componentSmeltRequirements.wood}
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
                    <Progress value={componentProgress} className="w-full" />
                </div>
            ) : (
                <div className="flex justify-center items-center gap-2 mt-4">
                    <Button 
                        onClick={handleSmeltComponent} 
                        disabled={!canSmeltComponent || isBusy || gameState.playerStats.health <= 0}
                        className="w-full"
                        variant={canSmeltComponent ? 'default' : 'outline'}
                    >
                        <Power className="mr-2 h-4 w-4" />
                        Smelt
                    </Button>
                </div>
            )}
          </Card>

        <Separator />

         <Card className="bg-muted/50 p-4 w-full">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-grow">
                  <div className="flex items-center font-semibold text-base mb-2">
                    <Layers className="mr-2 h-5 w-5" /> Smelt Iron Ingot
                  </div>
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                        <span>Requires:</span>
                        <span className="flex items-center">
                            {resourceIcons['scrap']}
                            {itemData['scrap'].name}: {ironSmeltRequirements.scrap}
                        </span>
                        <span className="flex items-center">
                            {resourceIcons['wood']}
                            {itemData['wood'].name}: {ironSmeltRequirements.wood}
                        </span>
                    </div>
                     <div className="flex flex-wrap gap-x-4 gap-y-2">
                        <span>Creates:</span>
                        <span className="flex items-center">
                            {resourceIcons['ironIngot']}
                            {itemData['ironIngot'].name}: 1
                        </span>
                    </div>
                  </div>
              </div>
            </div>
             {gameState.ironIngotSmeltingQueue > 0 ? (
                <div className="flex flex-col gap-2 mt-4">
                    <p className="text-sm text-muted-foreground text-center flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Smelting... ({gameState.ironIngotSmeltingQueue} {gameState.ironIngotSmeltingQueue > 1 ? 'batches' : 'batch'} left)
                    </p>
                    <Progress value={ironProgress} className="w-full" />
                </div>
            ) : (
                <div className="flex justify-center items-center gap-2 mt-4">
                    <Button 
                        onClick={handleSmeltIron} 
                        disabled={!canSmeltIron || isBusy || gameState.playerStats.health <= 0}
                        className="w-full"
                        variant={canSmeltIron ? 'default' : 'outline'}
                    >
                        <Power className="mr-2 h-4 w-4" />
                        Smelt
                    </Button>
                </div>
            )}
          </Card>
      </CardContent>
    </Card>
  );
}
