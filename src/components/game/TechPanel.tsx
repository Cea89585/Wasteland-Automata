// src/components/game/TechPanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Coins } from 'lucide-react';

const BASE_COST = 10000;
const BASE_CAPACITY = 200;
const CAPACITY_PER_LEVEL = 50;

export default function TechPanel() {
  const { gameState, dispatch } = useGame();
  const { storageLevel, inventory, playerStats, isResting, smeltingQueue } = gameState;

  const calculateCost = (level: number): number => {
    if (level === 0) return BASE_COST;
    let cost = BASE_COST;
    for (let i = 1; i <= level; i++) {
      cost = cost * 2 + BASE_COST;
    }
    return cost;
  };
  
  const upgradeCost = calculateCost(storageLevel);
  const currentCapacity = BASE_CAPACITY + storageLevel * CAPACITY_PER_LEVEL;

  const canAfford = inventory.silver >= upgradeCost;
  const isBusy = isResting || smeltingQueue > 0;
  const isDead = playerStats.health <= 0;

  const handleUpgrade = () => {
    dispatch({ type: 'UPGRADE_STORAGE' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technology & Upgrades</CardTitle>
        <CardDescription>Use silver to unlock permanent upgrades for your operation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Card className="bg-muted/50">
            <CardHeader>
                <CardTitle className="flex items-center text-xl gap-2">
                    <Database /> Storage Expansion
                </CardTitle>
                <CardDescription>Increase your maximum inventory capacity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-md bg-background/50">
                    <span className="font-medium">Current Level:</span>
                    <span className="font-mono text-lg font-semibold text-primary">{storageLevel}</span>
                </div>
                 <div className="flex justify-between items-center p-3 rounded-md bg-background/50">
                    <span className="font-medium">Current Capacity:</span>
                    <span className="font-mono text-lg font-semibold text-primary">{currentCapacity}</span>
                </div>

                <div className="text-center pt-4">
                    <p className="text-sm text-muted-foreground">Next Upgrade Cost:</p>
                    <p className="text-2xl font-bold font-mono text-primary flex items-center justify-center gap-2">
                        <Coins className="h-6 w-6 text-yellow-500" />
                        {upgradeCost.toLocaleString()}
                    </p>
                </div>
                
                <Button 
                    className="w-full mt-4" 
                    onClick={handleUpgrade}
                    disabled={!canAfford || isBusy || isDead}
                >
                    Upgrade Storage (+{CAPACITY_PER_LEVEL} Capacity)
                </Button>
            </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
