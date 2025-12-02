import React, { useState, useEffect } from 'react';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sprout, Apple, Timer } from 'lucide-react';
import { itemData } from '@/lib/game-data/items';
import type { Resource } from '@/lib/game-types';

export default function FarmingPanel() {
    const { gameState, dispatch } = useGame();
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const plots = gameState.farmPlots || [];
    // Ensure we display at least 3 plots if Hydroponics Bay is built
    const displayPlots = Array.from({ length: 3 }).map((_, i) => {
        const existing = plots.find(p => p.id === i);
        return existing || { id: i, seed: null, plantedTimestamp: null, duration: 0 };
    });

    const handlePlant = (plotId: number, seed: Resource) => {
        dispatch({ type: 'PLANT_SEED', payload: { plotId, seed } });
    };

    const handleHarvest = (plotId: number) => {
        dispatch({ type: 'HARVEST_CROP', payload: { plotId } });
    };

    const seeds: Resource[] = ['appleSeeds'];

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sprout className="h-5 w-5" />
                        Hydroponics Farming
                    </CardTitle>
                    <CardDescription>
                        Grow crops in a controlled environment.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {displayPlots.map((plot) => {
                            const isPlanted = !!plot.seed;
                            const progress = isPlanted && plot.plantedTimestamp
                                ? Math.min(100, ((now - plot.plantedTimestamp) / plot.duration) * 100)
                                : 0;
                            const isReady = progress >= 100;
                            const timeLeft = isPlanted && plot.plantedTimestamp
                                ? Math.max(0, Math.ceil((plot.plantedTimestamp + plot.duration - now) / 1000))
                                : 0;

                            return (
                                <Card key={plot.id} className="bg-secondary/20">
                                    <CardContent className="p-4 flex flex-col items-center justify-center gap-3 min-h-[160px]">
                                        {isPlanted ? (
                                            <>
                                                <div className="relative">
                                                    {plot.seed === 'appleSeeds' && <Apple className={`h-8 w-8 ${isReady ? 'text-red-500 animate-pulse' : 'text-green-600'}`} />}
                                                    {isReady && <Badge className="absolute -top-2 -right-6 bg-green-600">Ready</Badge>}
                                                </div>
                                                <div className="text-sm font-medium">{itemData[plot.seed!].name}</div>

                                                {!isReady && (
                                                    <div className="w-full space-y-1">
                                                        <Progress value={progress} className="h-2" />
                                                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                                            <Timer className="h-3 w-3" />
                                                            <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {isReady && (
                                                    <Button size="sm" onClick={() => handleHarvest(plot.id)} className="w-full">
                                                        Harvest
                                                    </Button>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <div className="h-8 w-8 rounded-full bg-muted border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
                                                    <Sprout className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <div className="text-sm text-muted-foreground">Empty Plot</div>
                                                <div className="flex flex-wrap gap-2 justify-center">
                                                    {seeds.map(seed => (
                                                        <Button
                                                            key={seed}
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={(gameState.inventory[seed] || 0) <= 0}
                                                            onClick={() => handlePlant(plot.id, seed)}
                                                        >
                                                            Plant {itemData[seed].name} ({(gameState.inventory[seed] || 0)})
                                                        </Button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
