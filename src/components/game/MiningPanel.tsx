import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GameIcon } from '@/lib/icon-mapping';
import { Pickaxe, Bed, Loader2 } from 'lucide-react';

const REST_DURATION_SECONDS = 10;

export default function MiningPanel() {
    const { gameState, dispatch } = useGame();
    const { equipment, playerStats, inventory, isResting } = gameState;
    const hasPickaxe = equipment.hand === 'pickaxe';
    const [restingProgress, setRestingProgress] = useState(0);

    const handleMine = () => {
        dispatch({ type: 'MINE' });
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

                    {/* Action Section */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <Button
                                size="lg"
                                className="flex-1 h-16 text-lg gap-2"
                                onClick={handleMine}
                                disabled={!hasPickaxe || playerStats.energy < 10 || isResting}
                            >
                                <GameIcon type="nav" id="mining" className="h-6 w-6" />
                                Mine Resources
                            </Button>

                            <Button
                                variant="outline"
                                size="lg"
                                className="flex-1 h-16 text-lg gap-2"
                                onClick={handleRest}
                                disabled={isResting || playerStats.health <= 0}
                            >
                                {isResting ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <Bed className="h-6 w-6" />
                                )}
                                {isResting ? 'Resting...' : 'Rest (+15 Energy)'}
                            </Button>
                        </div>

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
                    </div>

                    {/* Loot Table Info - Hidden on mobile to save space */}
                    <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                        <div className="p-3 border rounded-lg bg-card flex flex-col items-center text-center gap-2">
                            <GameIcon type="item" id="stone" size={32} />
                            <span className="font-medium">Stone</span>
                            <span className="text-xs text-muted-foreground">Common</span>
                        </div>
                        <div className="p-3 border rounded-lg bg-card flex flex-col items-center text-center gap-2">
                            <GameIcon type="item" id="scrap" size={32} />
                            <span className="font-medium">Scrap Metal</span>
                            <span className="text-xs text-muted-foreground">Uncommon</span>
                        </div>
                        <div className="p-3 border rounded-lg bg-card flex flex-col items-center text-center gap-2">
                            <GameIcon type="item" id="ironIngot" size={32} />
                            <span className="font-medium">Iron Ingot</span>
                            <span className="text-xs text-muted-foreground">Uncommon</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
