// src/components/game/DronePanel.tsx
'use client';
import { useState, useEffect } from 'react';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Loader2 } from 'lucide-react';
import { Progress } from '../ui/progress';
import { resourceIcons } from './GameIcons';
import { itemData } from '@/lib/game-data/items';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const MISSION_DURATION = 30; // seconds

export default function DronePanel() {
  const { gameState, dispatch } = useGame();
  const [progress, setProgress] = useState(0);

  const missionRequirements = { apple: 10, water: 10 };
  const canSend = gameState.inventory.apple >= missionRequirements.apple && gameState.inventory.water >= missionRequirements.water;
  const isBusy = gameState.isResting || gameState.smeltingQueue > 0;

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (gameState.droneIsActive && gameState.droneReturnTimestamp) {
      const startTime = gameState.droneReturnTimestamp - (MISSION_DURATION * 1000);
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const currentProgress = Math.min(100, (elapsed / (MISSION_DURATION * 1000)) * 100);
        setProgress(currentProgress);
      }, 500);
    } else {
        setProgress(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.droneIsActive, gameState.droneReturnTimestamp]);


  const handleSendDrone = () => {
    if (!canSend) {
      dispatch({ type: 'ADD_LOG', payload: { text: "Not enough resources to send the drone.", type: 'danger' } });
      return;
    }
    dispatch({ type: 'SEND_DRONE' });
  };

  const droneStatusNode = () => {
      if (gameState.droneIsActive) {
          return (
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Exploring...
                    </p>
                    <span className="text-xs font-mono text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full h-2" />
            </div>
          )
      }
      return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        onClick={handleSendDrone}
                        disabled={!canSend || isBusy || gameState.playerStats.health <= 0}
                        className="w-full"
                        variant={canSend ? 'default' : 'outline'}
                    >
                        <Bot className="mr-2 h-4 w-4" />
                        Send Drone
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="flex flex-col gap-1 text-sm items-start">
                        <span>Send a drone on a {MISSION_DURATION}s mission.</span>
                        <span className="font-semibold text-muted-foreground">Mission Cost:</span>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                            <span className="flex items-center">
                                {resourceIcons['apple']}
                                {itemData['apple'].name}: {missionRequirements.apple}
                            </span>
                            <span className="flex items-center">
                                {resourceIcons['water']}
                                {itemData['water'].name}: {missionRequirements.water}
                            </span>
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      )
  }

  return (
    <Card className="bg-muted/50">
        <CardContent className="p-2">
            <div className="flex items-center justify-center gap-4">
                {droneStatusNode()}
            </div>
      </CardContent>
    </Card>
  );
}
