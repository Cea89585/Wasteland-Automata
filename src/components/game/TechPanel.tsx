// src/components/game/TechPanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Coins, Battery, Sandwich, CupSoda, Heart } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

const BASE_STORAGE_COST = 10000;
const CAPACITY_PER_LEVEL = 50;
const BASE_CAPACITY = 200;

const BASE_CORE_COST = 5000;
const ENERGY_PER_LEVEL = 5;
const BASE_ENERGY = 100;

const BASE_STAT_COST = 5000;
const STAT_PER_LEVEL = 25;
const BASE_STAT = 100;

const MAX_STAT_CAP = 500;
const MAX_HEALTH_CAP = 1000;


export default function TechPanel() {
  const { gameState, dispatch } = useGame();
  const { storageLevel, energyLevel, hungerLevel, thirstLevel, healthLevel, inventory, playerStats, isResting, smeltingQueue } = gameState;

  const calculateCost = (level: number, baseCost: number, increment: number): number => {
    if (level === 0) return baseCost;
    let cost = baseCost;
    for (let i = 1; i <= level; i++) {
      cost = cost * 2 + increment;
    }
    return cost;
  };
  
  const storageUpgradeCost = calculateCost(storageLevel, BASE_STORAGE_COST, BASE_STORAGE_COST);
  const currentCapacity = BASE_CAPACITY + storageLevel * CAPACITY_PER_LEVEL;

  const energyUpgradeCost = calculateCost(energyLevel, BASE_CORE_COST, 1000);
  const currentEnergy = BASE_ENERGY + energyLevel * ENERGY_PER_LEVEL;

  const hungerUpgradeCost = calculateCost(hungerLevel, BASE_STAT_COST, 1000);
  const currentHungerCap = BASE_STAT + hungerLevel * STAT_PER_LEVEL;
  const isHungerCapped = currentHungerCap >= MAX_STAT_CAP;

  const thirstUpgradeCost = calculateCost(thirstLevel, BASE_STAT_COST, 1000);
  const currentThirstCap = BASE_STAT + thirstLevel * STAT_PER_LEVEL;
  const isThirstCapped = currentThirstCap >= MAX_STAT_CAP;
  
  const healthUpgradeCost = calculateCost(healthLevel, BASE_STAT_COST, 1000);
  const currentHealthCap = BASE_STAT + healthLevel * STAT_PER_LEVEL;
  const isHealthCapped = currentHealthCap >= MAX_HEALTH_CAP;

  const canAffordStorage = inventory.silver >= storageUpgradeCost;
  const canAffordEnergy = inventory.silver >= energyUpgradeCost;
  const canAffordHunger = inventory.silver >= hungerUpgradeCost;
  const canAffordThirst = inventory.silver >= thirstUpgradeCost;
  const canAffordHealth = inventory.silver >= healthUpgradeCost;

  const isBusy = isResting || smeltingQueue > 0;
  const isDead = playerStats.health <= 0;

  const handleUpgradeStorage = () => dispatch({ type: 'UPGRADE_STORAGE' });
  const handleUpgradeEnergy = () => dispatch({ type: 'UPGRADE_ENERGY' });
  const handleUpgradeHunger = () => dispatch({ type: 'UPGRADE_HUNGER' });
  const handleUpgradeThirst = () => dispatch({ type: 'UPGRADE_THIRST' });
  const handleUpgradeHealth = () => dispatch({ type: 'UPGRADE_HEALTH' });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technology & Upgrades</CardTitle>
        <CardDescription>Use silver to unlock permanent upgrades for your operation.</CardDescription>
      </CardHeader>
      <CardContent>
       <ScrollArea className="h-[300px]">
        <div className="space-y-4 pr-4">
            {/* Storage */}
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl gap-2"><Database /> Storage Expansion</CardTitle>
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
                            {storageUpgradeCost.toLocaleString()}
                        </p>
                    </div>
                    <Button className="w-full mt-4" onClick={handleUpgradeStorage} disabled={!canAffordStorage || isBusy || isDead}>
                        Upgrade Storage (+{CAPACITY_PER_LEVEL} Capacity)
                    </Button>
                </CardContent>
            </Card>

            {/* Energy */}
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl gap-2"><Battery /> Energy Core</CardTitle>
                    <CardDescription>Increase your maximum energy reserves.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-md bg-background/50">
                        <span className="font-medium">Current Level:</span>
                        <span className="font-mono text-lg font-semibold text-primary">{energyLevel}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-md bg-background/50">
                        <span className="font-medium">Current Max Energy:</span>
                        <span className="font-mono text-lg font-semibold text-primary">{currentEnergy}</span>
                    </div>
                    <div className="text-center pt-4">
                        <p className="text-sm text-muted-foreground">Next Upgrade Cost:</p>
                        <p className="text-2xl font-bold font-mono text-primary flex items-center justify-center gap-2">
                            <Coins className="h-6 w-6 text-yellow-500" />
                            {energyUpgradeCost.toLocaleString()}
                        </p>
                    </div>
                    <Button className="w-full mt-4" onClick={handleUpgradeEnergy} disabled={!canAffordEnergy || isBusy || isDead}>
                        Upgrade Energy (+{ENERGY_PER_LEVEL} Max Energy)
                    </Button>
                </CardContent>
            </Card>

             {/* Health */}
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl gap-2"><Heart /> Exo-Weave Plating</CardTitle>
                    <CardDescription>Increase your maximum health.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-md bg-background/50">
                        <span className="font-medium">Current Level:</span>
                        <span className="font-mono text-lg font-semibold text-primary">{healthLevel}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-md bg-background/50">
                        <span className="font-medium">Current Max Health:</span>
                        <span className="font-mono text-lg font-semibold text-primary">{Math.min(MAX_HEALTH_CAP, currentHealthCap)}</span>
                    </div>
                    <div className="text-center pt-4">
                        <p className="text-sm text-muted-foreground">Next Upgrade Cost:</p>
                        <p className="text-2xl font-bold font-mono text-primary flex items-center justify-center gap-2">
                            <Coins className="h-6 w-6 text-yellow-500" />
                            {isHealthCapped ? "MAX" : healthUpgradeCost.toLocaleString()}
                        </p>
                    </div>
                    <Button className="w-full mt-4" onClick={handleUpgradeHealth} disabled={!canAffordHealth || isBusy || isDead || isHealthCapped}>
                        {isHealthCapped ? "Max Level Reached" : `Upgrade Health (+${STAT_PER_LEVEL} Max Health)`}
                    </Button>
                </CardContent>
            </Card>

            {/* Hunger */}
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl gap-2"><Sandwich /> Stomach Lining</CardTitle>
                    <CardDescription>Increase your maximum hunger capacity.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-md bg-background/50">
                        <span className="font-medium">Current Level:</span>
                        <span className="font-mono text-lg font-semibold text-primary">{hungerLevel}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-md bg-background/50">
                        <span className="font-medium">Current Max Hunger:</span>
                        <span className="font-mono text-lg font-semibold text-primary">{Math.min(MAX_STAT_CAP, currentHungerCap)}</span>
                    </div>
                    <div className="text-center pt-4">
                        <p className="text-sm text-muted-foreground">Next Upgrade Cost:</p>
                        <p className="text-2xl font-bold font-mono text-primary flex items-center justify-center gap-2">
                            <Coins className="h-6 w-6 text-yellow-500" />
                            {isHungerCapped ? "MAX" : hungerUpgradeCost.toLocaleString()}
                        </p>
                    </div>
                    <Button className="w-full mt-4" onClick={handleUpgradeHunger} disabled={!canAffordHunger || isBusy || isDead || isHungerCapped}>
                        {isHungerCapped ? "Max Level Reached" : `Upgrade Hunger (+${STAT_PER_LEVEL} Max Hunger)`}
                    </Button>
                </CardContent>
            </Card>

            {/* Thirst */}
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl gap-2"><CupSoda /> Hydro-Recycling</CardTitle>
                    <CardDescription>Increase your maximum thirst capacity.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-md bg-background/50">
                        <span className="font-medium">Current Level:</span>
                        <span className="font-mono text-lg font-semibold text-primary">{thirstLevel}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-md bg-background/50">
                        <span className="font-medium">Current Max Thirst:</span>
                        <span className="font-mono text-lg font-semibold text-primary">{Math.min(MAX_STAT_CAP, currentThirstCap)}</span>
                    </div>
                    <div className="text-center pt-4">
                        <p className="text-sm text-muted-foreground">Next Upgrade Cost:</p>
                        <p className="text-2xl font-bold font-mono text-primary flex items-center justify-center gap-2">
                            <Coins className="h-6 w-6 text-yellow-500" />
                            {isThirstCapped ? "MAX" : thirstUpgradeCost.toLocaleString()}
                        </p>
                    </div>
                    <Button className="w-full mt-4" onClick={handleUpgradeThirst} disabled={!canAffordThirst || isBusy || isDead || isThirstCapped}>
                        {isThirstCapped ? "Max Level Reached" : `Upgrade Thirst (+${STAT_PER_LEVEL} Max Thirst)`}
                    </Button>
                </CardContent>
            </Card>
        </div>
       </ScrollArea>
      </CardContent>
    </Card>
  );
}
