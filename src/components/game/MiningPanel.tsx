import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GameIcon } from '@/lib/icon-mapping';
import { Pickaxe, Bed, Loader2 } from 'lucide-react';
import DronePanel from './DronePanel';

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

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GameIcon type="nav" id="mining" className="h-6 w-6" />
                        The Old Mines
                    </CardTitle>
                    <CardDescription>
                        A rich vein of resources deep within the earth. Requires a Pickaxe to work.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Status Section */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-muted/50 rounded-lg border">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${hasPickaxe ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                <GameIcon type="item" id="pickaxe" size={24} fallback={<Pickaxe className="h-6 w-6" />} />
                            </div>
                            <div>
                                <h3 className="font-medium">Equipment Status</h3>
                                <p className="text-sm text-muted-foreground">
                                    {hasPickaxe ? "Pickaxe Equipped" : "No Pickaxe Equipped"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Energy Cost:</span>
                            <span className="font-medium text-yellow-600 dark:text-yellow-400">10 Energy</span>
                        </div>
                    </div>

                    {/* Drone Section */}
                    {gameState.builtStructures.includes('droneBay') && (
                        <DronePanel mode="mine" />
                    )}

                    {/* Action Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                        <Button
                            className="w-full"
                            onClick={handleMine}
                            disabled={!hasPickaxe || playerStats.energy < 10 || isResting || isMining}
                        >
                            {isMining || isResting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <GameIcon type="nav" id="mining" className="mr-2 h-4 w-4" />
                            )}
                            {isMining ? 'Mining...' : 'Mine (10 Energy)'}
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleRest}
                            disabled={isResting || playerStats.health <= 0}
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
                        <div className="space-y-2 w-full">
                            <Progress value={miningProgress} className="w-full" />
                            <p className="text-sm text-center text-muted-foreground font-mono">
                                Extracting Core Samples... {Math.floor(miningProgress)}%
                            </p>
                        </div>
                    )}

                    {isResting && (
                        <div className="space-y-2 w-full">
                            <Progress value={restingProgress} className="w-full" />
                            <p className="text-sm text-center text-muted-foreground">
                                Resting... {Math.floor(restingProgress)}%
                            </p>
                        </div>
                    )}

                    {!hasPickaxe && (
                        <p className="text-sm text-destructive">
                            You need to craft and equip a Pickaxe to mine here.
                        </p>
                    )}
                    {hasPickaxe && playerStats.energy < 10 && (
                        <p className="text-sm text-destructive">
                            Not enough energy. Rest or eat to recover.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
