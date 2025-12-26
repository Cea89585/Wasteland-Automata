// src/components/game/TechPanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Coins, Battery, Sandwich, CupSoda, Heart, Bot, PlusCircle, Sprout, Cog, Zap, TrendingUp, Fish, BedDouble } from 'lucide-react';
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
  const {
    storageLevel, energyLevel, hungerLevel, thirstLevel, healthLevel, droneLevel,
    farmPlotLevel, machineSlotLevel, automationSpeedLevel, explorationEfficiencyLevel,
    hasFishingLuck, restEfficiencyLevel,
    inventory, playerStats, isResting, smeltingQueue
  } = gameState;

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

  // New upgrades
  const BASE_FARM_PLOT_COST = 15000;
  const farmPlotCost = calculateCost(farmPlotLevel, BASE_FARM_PLOT_COST, BASE_FARM_PLOT_COST / 5);

  const BASE_MACHINE_SLOT_COST = 20000;
  const machineSlotCost = calculateCost(machineSlotLevel, BASE_MACHINE_SLOT_COST, BASE_MACHINE_SLOT_COST / 5);

  const BASE_AUTO_SPEED_COST = 15000;
  const autoSpeedCost = calculateCost(automationSpeedLevel, BASE_AUTO_SPEED_COST, BASE_AUTO_SPEED_COST / 5);

  const BASE_EXPLORATION_COST = 12000;
  const explorationCost = calculateCost(explorationEfficiencyLevel, BASE_EXPLORATION_COST, BASE_EXPLORATION_COST / 5);

  const FISHING_LUCK_COST = 10000;

  const BASE_REST_COST = 7000;
  const MAX_REST_LEVEL = 6;
  const restCost = calculateCost(restEfficiencyLevel, BASE_REST_COST, BASE_REST_COST / 5);
  const isRestCapped = restEfficiencyLevel >= MAX_REST_LEVEL;

  const canAffordStorage = inventory.silver >= storageUpgradeCost;
  const canAffordEnergy = inventory.silver >= energyUpgradeCost;
  const canAffordHunger = inventory.silver >= hungerUpgradeCost;
  const canAffordThirst = inventory.silver >= thirstUpgradeCost;
  const canAffordHealth = inventory.silver >= healthUpgradeCost;
  const canAffordDrone = inventory.silver >= DRONE_UPGRADE_COST;
  const canAffordFarmPlot = inventory.silver >= farmPlotCost;
  const canAffordMachineSlot = inventory.silver >= machineSlotCost;
  const canAffordAutoSpeed = inventory.silver >= autoSpeedCost;
  const canAffordExploration = inventory.silver >= explorationCost;
  const canAffordFishingLuck = inventory.silver >= FISHING_LUCK_COST && !hasFishingLuck;
  const canAffordRest = inventory.silver >= restCost;

  const isBusy = isResting;
  const isDead = playerStats.health <= 0;

  const handleUpgradeStorage = () => dispatch({ type: 'UPGRADE_STORAGE' });
  const handleUpgradeEnergy = () => dispatch({ type: 'UPGRADE_ENERGY' });
  const handleUpgradeHunger = () => dispatch({ type: 'UPGRADE_HUNGER' });
  const handleUpgradeThirst = () => dispatch({ type: 'UPGRADE_THIRST' });
  const handleUpgradeHealth = () => dispatch({ type: 'UPGRADE_HEALTH' });
  const handleUpgradeDrone = () => dispatch({ type: 'UPGRADE_DRONE' });
  const handleUpgradeFarmPlot = () => dispatch({ type: 'UPGRADE_FARM_PLOT' });
  const handleUpgradeMachineSlot = () => dispatch({ type: 'UPGRADE_MACHINE_SLOT' });
  const handleUpgradeAutoSpeed = () => dispatch({ type: 'UPGRADE_AUTOMATION_SPEED' });
  const handleUpgradeExploration = () => dispatch({ type: 'UPGRADE_EXPLORATION_EFFICIENCY' });
  const handleUpgradeFishingLuck = () => dispatch({ type: 'UPGRADE_FISHING_LUCK' });
  const handleUpgradeRest = () => dispatch({ type: 'UPGRADE_REST_EFFICIENCY' });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technology & Upgrades</CardTitle>
        <CardDescription>Use silver to unlock permanent upgrades for your operation.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
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

          {/* Farm Plot Expansion */}
          {gameState.builtStructures.includes('hydroponicsBay') && (
            <UpgradeItem
              title="Farm Plot Expansion"
              description="Add additional crop plots to your hydroponics bay."
              icon={<Sprout className="mr-2 h-5 w-5" />}
              level={farmPlotLevel}
              currentEffect={`${farmPlotLevel} Extra Plots`}
              nextEffect={`${farmPlotLevel + 1} Extra Plots`}
              cost={farmPlotCost}
              onUpgrade={handleUpgradeFarmPlot}
              canAfford={canAffordFarmPlot}
              isBusy={isBusy}
              isDead={isDead}
            />
          )}

          {/* Machine Slots */}
          {gameState.builtStructures.includes('generator') && (
            <UpgradeItem
              title="Machine Capacity"
              description="Increase the number of machines you can build."
              icon={<Cog className="mr-2 h-5 w-5" />}
              level={machineSlotLevel}
              currentEffect={`${machineSlotLevel} Extra Slots`}
              nextEffect={`${machineSlotLevel + 1} Extra Slots`}
              cost={machineSlotCost}
              onUpgrade={handleUpgradeMachineSlot}
              canAfford={canAffordMachineSlot}
              isBusy={isBusy}
              isDead={isDead}
            />
          )}

          {/* Automation Speed */}
          {gameState.builtStructures.includes('generator') && (
            <UpgradeItem
              title="Automation Speed"
              description="Machines and furnaces process materials faster."
              icon={<Zap className="mr-2 h-5 w-5" />}
              level={automationSpeedLevel}
              currentEffect={`${automationSpeedLevel * 5}% Faster`}
              nextEffect={`${(automationSpeedLevel + 1) * 5}% Faster`}
              cost={autoSpeedCost}
              onUpgrade={handleUpgradeAutoSpeed}
              canAfford={canAffordAutoSpeed}
              isBusy={isBusy}
              isDead={isDead}
            />
          )}

          {/* Exploration Efficiency */}
          <UpgradeItem
            title="Exploration Efficiency"
            description="Find more resources when exploring the wasteland."
            icon={<TrendingUp className="mr-2 h-5 w-5" />}
            level={explorationEfficiencyLevel}
            currentEffect={`+${explorationEfficiencyLevel * 10}% Resources`}
            nextEffect={`+${(explorationEfficiencyLevel + 1) * 10}% Resources`}
            cost={explorationCost}
            onUpgrade={handleUpgradeExploration}
            canAfford={canAffordExploration}
            isBusy={isBusy}
            isDead={isDead}
          />

          {/* Fishing Luck */}
          <UpgradeItem
            title="Fishing Luck"
            description="Permanently increase your chances of catching rare fish."
            icon={<Fish className="mr-2 h-5 w-5" />}
            level={hasFishingLuck ? 1 : 0}
            currentEffect={hasFishingLuck ? "Purchased" : "Not Purchased"}
            nextEffect="Better Rare Catches"
            cost={FISHING_LUCK_COST}
            onUpgrade={handleUpgradeFishingLuck}
            canAfford={canAffordFishingLuck}
            isCapped={hasFishingLuck}
            isBusy={isBusy}
            isDead={isDead}
          />

          {/* Rest Efficiency */}
          <UpgradeItem
            title="Rest Efficiency"
            description="Recover more health when resting (5% per level, max 30%)."
            icon={<BedDouble className="mr-2 h-5 w-5" />}
            level={restEfficiencyLevel}
            currentEffect={`+${restEfficiencyLevel * 5}% Recovery`}
            nextEffect={`+${(restEfficiencyLevel + 1) * 5}% Recovery`}
            cost={restCost}
            onUpgrade={handleUpgradeRest}
            canAfford={canAffordRest}
            isCapped={isRestCapped}
            isBusy={isBusy}
            isDead={isDead}
          />
        </div>
      </CardContent>
    </Card>
  );
}
