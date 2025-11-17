// src/components/game/FurnacePanel.tsx
'use client';
import { useState, useEffect } from 'react';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Power, Loader2, Cpu } from 'lucide-react';
import { Progress } from '../ui/progress';
import { resourceIcons } from './GameIcons';
import { itemData } from '@/lib/game-data/items';

const SMELT_DURATION = 10; // seconds

export default function FurnacePanel() {
  const { gameState, dispatch } = useGame();
  const [progress, setProgress] = useState(0);

  const canSmelt = gameState.inventory.scrap >= 10 && gameState.inventory.wood >= 4;
  const isBusy = gameState.isResting || gameState.isSmelting;

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (gameState.isSmelting) {
      interval = setInterval(() => {
        setProgress(prev => prev + (100 / SMELT_DURATION));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.isSmelting]);

  useEffect(() => {
    if (progress >= 100) {
      dispatch({ type: 'FINISH_SMELTING', payload: { components: 1 } });
      setProgress(0);
    }
  }, [progress, dispatch]);

  const handleSmelt = () => {
    if (!canSmelt) {
      dispatch({ type: 'ADD_LOG', payload: { text: "Not enough resources to smelt components.", type: 'danger' } });
      return;
    }
    dispatch({ type: 'START_SMELTING' });
    setProgress(0);
    dispatch({ type: 'ADD_LOG', payload: { text: "The furnace roars to life...", type: 'info' } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Furnace</CardTitle>
        <CardDescription>Smelt raw materials into advanced components.</CardDescription>
      </CardHeader>
      <CardContent>
        <Card className="bg-muted/50 p-6 w-full text-center">
            <CardTitle className="flex items-center justify-center text-xl mb-4">
              <Cpu className="mr-2 h-6 w-6" /> Smelt Components
            </CardTitle>
            <CardDescription className="mb-4">
              Turn scrap and wood into valuable electronic components.
            </CardDescription>

            <div className="flex flex-col gap-2 text-sm my-4 items-start mx-auto max-w-xs">
                <span className="font-semibold text-muted-foreground self-center">Requires:</span>
                <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
                    <span className="flex items-center">
                        {resourceIcons['scrap']}
                        {itemData['scrap'].name}: 10
                    </span>
                    <span className="flex items-center">
                        {resourceIcons['wood']}
                        {itemData['wood'].name}: 4
                    </span>
                </div>
                 <span className="font-semibold text-muted-foreground self-center mt-2">Creates:</span>
                 <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center w-full">
                    <span className="flex items-center">
                        {resourceIcons['components']}
                        {itemData['components'].name}: 1
                    </span>
                </div>
            </div>

            {gameState.isSmelting ? (
                <div className="flex flex-col gap-2 mt-4">
                    <p className="text-sm text-muted-foreground text-center flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Smelting in progress...
                    </p>
                    <Progress value={progress} className="w-full" />
                </div>
            ) : (
                <Button 
                    onClick={handleSmelt} 
                    disabled={!canSmelt || isBusy || gameState.playerStats.health <= 0}
                    className="w-full sm:w-auto mt-4"
                >
                    <Power className="mr-2 h-4 w-4" />
                    Smelt
                </Button>
            )}
          </Card>
      </CardContent>
    </Card>
  );
}
