// src/components/game/FishingPanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { fishingZones, getAvailableFishingZones } from '@/lib/game-data/fishing';
import { Fish, Droplet, Zap, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GameIcon } from '@/lib/icon-mapping';

export default function FishingPanel() {
    const { gameState, dispatch } = useGame();
    const { currentFishingZone, level, playerStats, isResting, smeltingQueue } = gameState;

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
