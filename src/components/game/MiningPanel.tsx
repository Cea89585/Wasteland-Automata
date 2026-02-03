import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GameIcon } from '@/lib/icon-mapping';
import { Pickaxe, Bed, Loader2, Zap } from 'lucide-react';
import DronePanel from './DronePanel';
import { cn } from '@/lib/utils';

const REST_DURATION_SECONDS = 10;

export default function MiningPanel() {
    const { gameState, dispatch } = useGame();
    const { equipment, playerStats, inventory, isResting } = gameState;
    const hasPickaxe = equipment.hand === 'pickaxe';
    const [restingProgress, setRestingProgress] = useState(0);
    const [isMining, setIsMining] = useState(false);
    const [miningProgress, setMiningProgress] = useState(0);

    const MINING_DURATION = 1500; // 1.5 seconds

    const handleMine = () => {
        if (!hasPickaxe || playerStats.energy < 10 || isResting || isMining) return;

        setIsMining(true);
        setMiningProgress(0);

        const interval = setInterval(() => {
            setMiningProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + (100 / (MINING_DURATION / 100));
            });
        }, 100);

        setTimeout(() => {
            dispatch({ type: 'MINE' });
            setIsMining(false);
            setMiningProgress(0);
        }, MINING_DURATION);
    };

    const finishResting = useCallback(() => {
        dispatch({ type: 'FINISH_RESTING' });
        dispatch({ type: 'ADD_LOG', payload: { text: "You feel rested and ready for action.", type: 'success' } });
        setRestingProgress(0);
    }, [dispatch]);

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;
        if (isResting) {
            interval = setInterval(() => {
                setRestingProgress(prev => prev + (100 / REST_DURATION_SECONDS));
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isResting]);

    useEffect(() => {
        if (restingProgress >= 100) {
            finishResting();
        }
    }, [restingProgress, finishResting]);

    const handleRest = () => {
        if (playerStats.energy >= 100) {
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

    const isBusy = isMining || isResting;
    const isDead = playerStats.health <= 0;

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2">
                        <GameIcon type="nav" id="mining" className="h-6 w-6" />
                        The Old Mines
                    </CardTitle>
                    <CardDescription>
                        A rich vein of resources deep within the earth. Requires a Pickaxe.
                    </CardDescription>
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
                <CardContent className="space-y-6">
                    {/* Drone Section */}
                    {gameState.builtStructures.includes('droneBay') && (
                        <DronePanel mode="mine" />
                    )}

                    {/* Action Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                        <div className="flex flex-col gap-1">
                            <Button
                                className="w-full"
                                onClick={handleMine}
                                disabled={!hasPickaxe || playerStats.energy < 10 || isBusy || isDead}
                            >
                                {isMining ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <GameIcon type="nav" id="mining" className="mr-2 h-4 w-4" />
                                )}
                                {isMining ? 'Mining...' : 'Mine (10 Energy)'}
                            </Button>
                            {!hasPickaxe && (
                                <p className="text-xs text-destructive text-center">
                                    Requires Pickaxe
                                </p>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleRest}
                            disabled={isBusy || isDead}
                        >
                            {isResting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Bed className="mr-2 h-4 w-4" />
                            )}
                            {isResting ? 'Resting...' : 'Rest (+15 Energy)'}
                        </Button>
                    </div>

                    {isMining && (
                        <div className="flex flex-col gap-2">
                            <Progress value={miningProgress} className="w-full" />
                            <p className="text-sm text-muted-foreground text-center font-mono">
                                Extracting Core Samples... {Math.floor(miningProgress)}%
                            </p>
                        </div>
                    )}

                    {isResting && (
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-muted-foreground text-center">
                                Resting... {Math.floor(restingProgress)}%
                            </p>
                            <Progress value={restingProgress} className="w-full" />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
