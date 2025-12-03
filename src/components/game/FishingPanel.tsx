// src/components/game/FishingPanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { fishingZones, getAvailableFishingZones } from '@/lib/game-data/fishing';
import { Fish, Droplet, Zap, TrendingUp, Coins } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GameIcon } from '@/lib/icon-mapping';

export default function FishingPanel() {
    const { gameState, dispatch } = useGame();
    const { currentFishingZone, caughtFish, level, playerStats, isResting, smeltingQueue } = gameState;

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

    const handleSellAllFish = () => {
        dispatch({ type: 'SELL_ALL_FISH' });
    };

    const handleZoneChange = (zoneId: string) => {
        dispatch({ type: 'SET_FISHING_ZONE', payload: { zoneId } });
    };

    // Calculate total fish count and value
    const totalFishCount = Object.values(caughtFish).reduce((sum, count) => sum + (count || 0), 0);

    let totalFishValue = 0;
    const allLoot: any[] = [];
    fishingZones.forEach(zone => {
        allLoot.push(...zone.lootTable);
    });

    Object.entries(caughtFish).forEach(([fishType, count]) => {
        if (count && count > 0) {
            const fishData = allLoot.find((loot: any) => loot.item === fishType && loot.isFish);
            if (fishData && fishData.silverValue) {
                totalFishValue += fishData.silverValue * count;
            }
        }
    });

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'veryCommon': return 'text-gray-500';
            case 'common': return 'text-green-600';
            case 'uncommon': return 'text-blue-600';
            case 'rare': return 'text-purple-600';
            case 'veryRare': return 'text-yellow-600';
            case 'superRare': return 'text-red-600';
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

                            <div className="grid grid-cols-3 gap-2 text-sm">
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

                            {!hasEnoughEnergy && (
                                <p className="text-sm text-destructive text-center">
                                    Not enough energy ({playerStats.energy}/{currentZone.energyCost})
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Caught Fish Inventory */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Caught Fish</CardTitle>
                            <CardDescription>
                                {totalFishCount} fish worth {totalFishValue} silver
                            </CardDescription>
                        </div>
                        <Button
                            onClick={handleSellAllFish}
                            disabled={totalFishCount === 0}
                            variant="outline"
                        >
                            <Coins className="mr-2 h-4 w-4" />
                            Sell All ({totalFishValue} Silver)
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[300px]">
                        {totalFishCount === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                <Fish className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No fish caught yet. Start fishing to build your collection!</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {Object.entries(caughtFish).map(([fishType, count]) => {
                                    if (!count || count === 0) return null;

                                    const fishData = allLoot.find((loot: any) => loot.item === fishType && loot.isFish);
                                    if (!fishData) return null;

                                    const totalValue = (fishData.silverValue || 0) * count;

                                    return (
                                        <div
                                            key={fishType}
                                            className="flex items-center justify-between p-3 bg-muted rounded-md"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium capitalize flex items-center gap-2">
                                                        <GameIcon type="item" id={fishType} size={20} />
                                                        {fishType.replace(/([A-Z])/g, ' $1').trim()}
                                                    </span>
                                                    <Badge variant="outline" className={getRarityColor(fishData.rarity)}>
                                                        {fishData.rarity}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {fishData.silverValue} silver each
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">{count}x</p>
                                                <p className="text-sm text-muted-foreground">{totalValue} silver</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>
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
