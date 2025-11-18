// src/components/game/DronePanel.tsx
'use client';
import { useState, useEffect } from 'react';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Loader2, Apple, GlassWater } from 'lucide-react';
import { Progress } from '../ui/progress';
import { resourceIcons } from './GameIcons';
import { itemData } from '@/lib/game-data/items';

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

  return (
    <Card className="bg-muted/50">
        <CardHeader>
            <CardTitle className="flex items-center text-xl mb-2">
                <Bot className="mr-2 h-6 w-6" /> Scavenger Drone
            </CardTitle>
            <CardDescription>
                Automate resource collection by sending a drone on exploration missions.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col gap-2 text-sm my-4 items-start mx-auto max-w-xs">
                <span className="font-semibold text-muted-foreground self-center">Mission Cost:</span>
                <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center w-full">
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

            {gameState.droneIsActive ? (
                <div className="flex flex-col gap-2 mt-4">
                    <p className="text-sm text-muted-foreground text-center flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Drone exploring...
                    </p>
                    <Progress value={progress} className="w-full" />
                </div>
            ) : (
                <div className="flex justify-center items-center gap-2 mt-4">
                    <Button
                        onClick={handleSendDrone}
                        disabled={!canSend || isBusy || gameState.playerStats.health <= 0}
                        className="w-full sm:w-auto"
                    >
                        <Bot className="mr-2 h-4 w-4" />
                        Send Drone ({MISSION_DURATION}s Mission)
                    </Button>
                </div>
            )}
      </CardContent>
    </Card>
  );
}
