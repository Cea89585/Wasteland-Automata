// src/components/game/FishingPanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { fishingZones, getAvailableFishingZones } from '@/lib/game-data/fishing';
import { Fish, Droplet, Zap, TrendingUp, Bed, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GameIcon } from '@/lib/icon-mapping';
import { useState, useEffect, useCallback } from 'react';
import { Progress } from '../ui/progress';

const REST_DURATION_SECONDS = 10;

export default function FishingPanel() {
    const { gameState, dispatch } = useGame();
    const { currentFishingZone, level, playerStats, isResting, smeltingQueue } = gameState;
    const [restingProgress, setRestingProgress] = useState(0);

    const availableZones = getAvailableFishingZones(level);
    const currentZone = fishingZones.find(z => z.id === currentFishingZone);

    const MAX_ENERGY = 100 + (gameState.energyLevel || 0) * 5;
    const canFish = !isResting && smeltingQueue === 0 && playerStats.health > 0;
    const hasEnoughEnergy = currentZone ? playerStats.energy >= currentZone.energyCost : false;

    const handleFish = () => {
        if (currentZone && canFish && hasEnoughEnergy) {
            dispatch({ type: 'FISH', payload: { zoneId: currentZone.id } });
        }
    };

    const handleZoneChange = (zoneId: string) => {
        dispatch({ type: 'SET_FISHING_ZONE', payload: { zoneId } });
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

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'very common': return 'text-gray-500';
            case 'common': return 'text-green-600';
            case 'uncommon': return 'text-blue-600';
            case 'rare': return 'text-purple-600';
            case 'very rare': return 'text-yellow-600';
            case 'super rare': return 'text-red-600';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="space-y-4">
            {/* Zone Selection Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Fish className="h-5 w-5" />
                        Fishing Zones
                    </CardTitle>
                    <CardDescription>Select a fishing zone and cast your line into the wasteland waters.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Current Zone</label>
                        <Select value={currentFishingZone} onValueChange={handleZoneChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a zone" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableZones.map(zone => (
                                    <SelectItem key={zone.id} value={zone.id}>
                                        {zone.name} (Lv {zone.levelRequirement}) - {zone.energyCost} Energy
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {currentZone && (
                        <div className="space-y-3">
                            <div className="p-3 bg-muted rounded-md">
                                <p className="text-sm text-muted-foreground">{currentZone.description}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                                <div className="flex items-center gap-1">
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                    <span>Level {currentZone.levelRequirement}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Zap className="h-4 w-4 text-yellow-500" />
                                    <span>{currentZone.energyCost} Energy</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Droplet className="h-4 w-4 text-blue-500" />
                                    <span>{currentZone.lootTable.length} Items</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleFish}
                                disabled={!canFish || !hasEnoughEnergy || playerStats.health <= 0}
                                className="w-full"
                                size="lg"
                            >
                                <Fish className="mr-2 h-4 w-4" />
                                Cast Line ({currentZone.energyCost} Energy)
                            </Button>

                            <Button
                                variant="outline"
                                onClick={handleRest}
                                disabled={isResting || playerStats.health <= 0}
                                className="w-full"
                                size="lg"
                            >
                                {isResting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Bed className="mr-2 h-4 w-4" />
                                )}
                                {isResting ? 'Resting...' : 'Rest (+15 Energy)'}
                            </Button>

                            {isResting && (
                                <div className="space-y-2">
                                    <Progress value={restingProgress} className="w-full" />
                                    <p className="text-sm text-center text-muted-foreground">
                                        Resting... {Math.floor(restingProgress)}%
                                    </p>
                                </div>
                            )}

                            {!hasEnoughEnergy && (
                                <p className="text-sm text-destructive text-center">
                                    Not enough energy ({playerStats.energy}/{currentZone.energyCost})
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Loot Table Preview */}
            {currentZone && (
                <Card>
                    <CardHeader>
                        <CardTitle>Possible Catches</CardTitle>
                        <CardDescription>Items you can find in {currentZone.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[200px]">
                            <div className="grid grid-cols-2 gap-2">
                                {currentZone.lootTable.map((loot, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                                    >
                                        <span className="capitalize flex items-center gap-2">
                                            <GameIcon type="item" id={loot.item as string} size={16} />
                                            {(loot.item as string).replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <Badge variant="outline" className={getRarityColor(loot.rarity)}>
                                            {loot.rarity}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
