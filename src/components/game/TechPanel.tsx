// src/components/game/TechPanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Coins, Battery, Sandwich, CupSoda, Heart, Bot, PlusCircle } from 'lucide-react';
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

const DRONE_UPGRADE_COST = 10000;
const DRONE_BONUS_PER_LEVEL = 10;
const MAX_DRONE_LEVEL = 20;

const UpgradeItem = ({ title, description, icon, level, currentEffect, nextEffect, cost, onUpgrade, canAfford, isCapped, isBusy, isDead }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  level: number;
  currentEffect: string;
  nextEffect: string;
  cost: number;
  onUpgrade: () => void;
  canAfford: boolean;
  isCapped?: boolean;
  isBusy: boolean;
  isDead: boolean;
}) => (
    <Card className="bg-muted/50 w-full">
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-grow">
          <div className="flex items-center font-semibold text-base mb-2">
            {icon} {title} (Lvl {level})
          </div>
          <p className="text-xs text-muted-foreground mb-3">{description}</p>
          <div className="text-xs text-muted-foreground flex flex-col sm:flex-row sm:gap-4">
              <span>Current: {currentEffect}</span>
              {!isCapped && <span>Next: {nextEffect}</span>}
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center justify-center font-bold font-mono text-sm text-primary gap-1">
            <Coins className="h-4 w-4 text-yellow-500" />
            {isCapped ? "MAX" : cost.toLocaleString()}
          </div>
          <Button 
            size="sm"
            className="w-full"
            variant={canAfford && !isCapped ? 'default' : 'outline'}
            onClick={onUpgrade} 
            disabled={!canAfford || isBusy || isDead || isCapped}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            {isCapped ? 'Max Level' : 'Upgrade'}
          </Button>
        </div>
      </CardContent>
    </Card>
);

export default function TechPanel() {
  const { gameState, dispatch } = useGame();
  const { storageLevel, energyLevel, hungerLevel, thirstLevel, healthLevel, droneLevel, inventory, playerStats, isResting, smeltingQueue } = gameState;

  const calculateCost = (level: number, baseCost: number, increment: number): number => {
    if (level === 0) return baseCost;
    let cost = baseCost;
    for (let i = 1; i <= level; i++) {
      cost = Math.floor(cost * 1.5 + increment);
    }
    return cost;
  };
  
  const storageUpgradeCost = calculateCost(storageLevel, BASE_STORAGE_COST, BASE_STORAGE_COST / 10);
  const currentCapacity = BASE_CAPACITY + storageLevel * CAPACITY_PER_LEVEL;

  const energyUpgradeCost = calculateCost(energyLevel, BASE_CORE_COST, BASE_CORE_COST / 5);
  const currentEnergy = BASE_ENERGY + energyLevel * ENERGY_PER_LEVEL;

  const hungerUpgradeCost = calculateCost(hungerLevel, BASE_STAT_COST, BASE_STAT_COST / 5);
  const currentHungerCap = BASE_STAT + hungerLevel * STAT_PER_LEVEL;
  const isHungerCapped = currentHungerCap >= MAX_STAT_CAP;

  const thirstUpgradeCost = calculateCost(thirstLevel, BASE_STAT_COST, BASE_STAT_COST / 5);
  const currentThirstCap = BASE_STAT + thirstLevel * STAT_PER_LEVEL;
  const isThirstCapped = currentThirstCap >= MAX_STAT_CAP;
  
  const healthUpgradeCost = calculateCost(healthLevel, BASE_STAT_COST, BASE_STAT_COST / 5);
  const currentHealthCap = BASE_STAT + healthLevel * STAT_PER_LEVEL;
  const isHealthCapped = currentHealthCap >= MAX_HEALTH_CAP;

  const currentDroneBonus = droneLevel * DRONE_BONUS_PER_LEVEL;
  const isDroneCapped = droneLevel >= MAX_DRONE_LEVEL;

  const canAffordStorage = inventory.silver >= storageUpgradeCost;
  const canAffordEnergy = inventory.silver >= energyUpgradeCost;
  const canAffordHunger = inventory.silver >= hungerUpgradeCost;
  const canAffordThirst = inventory.silver >= thirstUpgradeCost;
  const canAffordHealth = inventory.silver >= healthUpgradeCost;
  const canAffordDrone = inventory.silver >= DRONE_UPGRADE_COST;

  const isBusy = isResting || smeltingQueue > 0;
  const isDead = playerStats.health <= 0;

  const handleUpgradeStorage = () => dispatch({ type: 'UPGRADE_STORAGE' });
  const handleUpgradeEnergy = () => dispatch({ type: 'UPGRADE_ENERGY' });
  const handleUpgradeHunger = () => dispatch({ type: 'UPGRADE_HUNGER' });
  const handleUpgradeThirst = () => dispatch({ type: 'UPGRADE_THIRST' });
  const handleUpgradeHealth = () => dispatch({ type: 'UPGRADE_HEALTH' });
  const handleUpgradeDrone = () => dispatch({ type: 'UPGRADE_DRONE' });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technology & Upgrades</CardTitle>
        <CardDescription>Use silver to unlock permanent upgrades for your operation.</CardDescription>
      </CardHeader>
      <CardContent>
       <ScrollArea className="h-[300px]">
        <div className="space-y-2 pr-4">
            {/* Drone Upgrade */}
            {gameState.builtStructures.includes('droneBay') && (
              <UpgradeItem
                title="Drone Efficiency"
                description="Improve the resource yield from scavenger drone missions."
                icon={<Bot className="mr-2 h-5 w-5" />}
                level={droneLevel}
                currentEffect={`+${currentDroneBonus}% Yield`}
                nextEffect={`+${currentDroneBonus + DRONE_BONUS_PER_LEVEL}% Yield`}
                cost={DRONE_UPGRADE_COST}
                onUpgrade={handleUpgradeDrone}
                canAfford={canAffordDrone}
                isCapped={isDroneCapped}
                isBusy={isBusy}
                isDead={isDead}
              />
            )}

            {/* Storage */}
            <UpgradeItem
                title="Storage Expansion"
                description="Increase your maximum inventory capacity for all items."
                icon={<Database className="mr-2 h-5 w-5" />}
                level={storageLevel}
                currentEffect={`${currentCapacity} Capacity`}
                nextEffect={`${currentCapacity + CAPACITY_PER_LEVEL} Capacity`}
                cost={storageUpgradeCost}
                onUpgrade={handleUpgradeStorage}
                canAfford={canAffordStorage}
                isBusy={isBusy}
                isDead={isDead}
            />

            {/* Energy */}
            <UpgradeItem
                title="Energy Core"
                description="Increase your maximum energy reserves for actions."
                icon={<Battery className="mr-2 h-5 w-5" />}
                level={energyLevel}
                currentEffect={`${currentEnergy} Max Energy`}
                nextEffect={`${currentEnergy + ENERGY_PER_LEVEL} Max Energy`}
                cost={energyUpgradeCost}
                onUpgrade={handleUpgradeEnergy}
                canAfford={canAffordEnergy}
                isBusy={isBusy}
                isDead={isDead}
            />

            {/* Health */}
            <UpgradeItem
                title="Exo-Weave Plating"
                description="Increase your maximum health capacity."
                icon={<Heart className="mr-2 h-5 w-5" />}
                level={healthLevel}
                currentEffect={`${currentHealthCap} Max Health`}
                nextEffect={`${currentHealthCap + STAT_PER_LEVEL} Max Health`}
                cost={healthUpgradeCost}
                onUpgrade={handleUpgradeHealth}
                canAfford={canAffordHealth}
                isCapped={isHealthCapped}
                isBusy={isBusy}
                isDead={isDead}
            />

            {/* Hunger */}
            <UpgradeItem
                title="Stomach Lining"
                description="Increase your maximum hunger capacity."
                icon={<Sandwich className="mr-2 h-5 w-5" />}
                level={hungerLevel}
                currentEffect={`${currentHungerCap} Max Hunger`}
                nextEffect={`${currentHungerCap + STAT_PER_LEVEL} Max Hunger`}
                cost={hungerUpgradeCost}
                onUpgrade={handleUpgradeHunger}
                canAfford={canAffordHunger}
                isCapped={isHungerCapped}
                isBusy={isBusy}
                isDead={isDead}
            />

            {/* Thirst */}
            <UpgradeItem
                title="Hydro-Recycling"
                description="Increase your maximum thirst capacity."
                icon={<CupSoda className="mr-2 h-5 w-5" />}
                level={thirstLevel}
                currentEffect={`${currentThirstCap} Max Thirst`}
                nextEffect={`${currentThirstCap + STAT_PER_LEVEL} Max Thirst`}
                cost={thirstUpgradeCost}
                onUpgrade={handleUpgradeThirst}
                canAfford={canAffordThirst}
                isCapped={isThirstCapped}
                isBusy={isBusy}
                isDead={isDead}
            />
        </div>
       </ScrollArea>
      </CardContent>
    </Card>
  );
}