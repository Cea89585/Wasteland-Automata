// src/components/game/DronePanel.tsx
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Loader2, Plus, Minus } from 'lucide-react';
import { Progress } from '../ui/progress';
import { GameIcon } from '@/lib/icon-mapping';
import { itemData } from '@/lib/game-data/items';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const MISSION_DURATION = 30; // seconds
const MAX_QUEUE = 10;

import { DroneMissionType } from '@/lib/game-types';

interface DronePanelProps {
  mode?: DroneMissionType;
}

export default function DronePanel({ mode = 'scavenge' }: DronePanelProps) {
  const { gameState, dispatch } = useGame();
  const [progress, setProgress] = useState(0);
  const [queueAmount, setQueueAmount] = useState(1);
  const { droneMissionQueue, power } = gameState;

  const missionRequirements = { water: 10 };
  const canAffordMissions = useMemo(() => {
    return Math.floor(gameState.inventory.water / missionRequirements.water);
  }, [gameState.inventory.water]);

  const hasPower = gameState.builtStructures.includes('generator') && power > 0;
  const isBusy = gameState.isResting || gameState.smeltingQueue > 0;
  const currentQueue = droneMissionQueue;

  const maxCanQueue = Math.min(MAX_QUEUE - currentQueue, canAffordMissions);

  useEffect(() => {
    if (queueAmount > maxCanQueue) {
      setQueueAmount(Math.max(1, maxCanQueue));
    }
    if (maxCanQueue === 0 && queueAmount > 0) {
      setQueueAmount(0);
    }
    if (maxCanQueue > 0 && queueAmount === 0) {
      setQueueAmount(1);
    }

  }, [maxCanQueue, queueAmount]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (gameState.droneIsActive && gameState.droneReturnTimestamp) {
      const startTime = gameState.droneReturnTimestamp - (MISSION_DURATION * 1000);

      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const currentProgress = Math.min(100, (elapsed / (MISSION_DURATION * 1000)) * 100);
        setProgress(currentProgress);
        if (currentProgress >= 100) {
          if (interval) clearInterval(interval);
        }
      };

      updateProgress();
      interval = setInterval(updateProgress, 500);

    } else {
      setProgress(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.droneIsActive, gameState.droneReturnTimestamp]);


  const handleQueueDroneMissions = () => {
    if (queueAmount > 0) {
      dispatch({ type: 'QUEUE_DRONE_MISSIONS', payload: { amount: queueAmount, type: mode } });
      setQueueAmount(1); // Reset after queuing
    }
  };

  const droneStatusNode = () => {
    if (!gameState.builtStructures.includes('generator')) {
      return (
        <div className="text-center text-xs text-muted-foreground p-2">
          The Drone Bay requires a Power Generator to be built and fueled to operate.
        </div>
      )
    }

    if (gameState.droneIsActive || currentQueue > 0) {
      // Use the actual queued mission type from game state, not the current panel mode
      const activeMissionType = gameState.droneMissionType || 'explore';
      const missionLabel = activeMissionType === 'mine' ? 'Mining' : activeMissionType === 'fish' ? 'Fishing' : activeMissionType === 'explore' ? 'Exploring' : 'Scavenging';
      return (
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {gameState.droneIsActive ? `${missionLabel}... (${currentQueue} in queue)` : `Queued (${currentQueue})`}
            </p>
            {gameState.droneIsActive && <span className="text-xs font-mono text-muted-foreground">{Math.round(progress)}%</span>}
          </div>
          {gameState.droneIsActive && <Progress value={progress} className="w-full h-2" />}
        </div>
      )
    }
    return (
      <TooltipProvider>
        <div className="flex items-center gap-2 w-full">
          <div className="flex items-center border rounded-md">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQueueAmount(prev => Math.max(1, prev - 1))} disabled={queueAmount <= 1}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="font-mono text-lg text-primary px-2">{queueAmount}</span>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQueueAmount(prev => Math.min(maxCanQueue, prev + 1))} disabled={queueAmount >= maxCanQueue}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex-grow">
                <Button
                  onClick={handleQueueDroneMissions}
                  disabled={!hasPower || isBusy || gameState.playerStats.health <= 0 || queueAmount === 0 || maxCanQueue === 0}
                  className="w-full"
                  variant={hasPower ? 'default' : 'outline'}
                >
                  <Bot className="mr-2 h-4 w-4" />
                  Queue {mode === 'mine' ? 'Mining' : mode === 'fish' ? 'Fishing' : mode === 'explore' ? 'Explore' : 'Scavenge'}
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex flex-col gap-1 text-sm items-start">
                {!hasPower ? (
                  <span>Generator has no power.</span>
                ) : maxCanQueue > 0 ? (
                  <>
                    <span>Queue {queueAmount} drone mission(s).</span>
                    <span className="font-semibold text-muted-foreground">Cost: {missionRequirements.water * queueAmount} Water (coolant)</span>
                  </>
                ) : (
                  <span>Not enough resources to queue a mission.</span>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
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
