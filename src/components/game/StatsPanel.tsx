// src/components/game/StatsPanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Progress } from '@/components/ui/progress';
import { statIcons } from './GameIcons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function StatsPanel() {
  const { gameState } = useGame();
  const { playerStats, energyLevel, hungerLevel, thirstLevel, healthLevel } = gameState;

  const maxEnergy = 100 + (energyLevel * 5);
  const maxHunger = Math.min(500, 100 + (hungerLevel * 25));
  const maxThirst = Math.min(500, 100 + (thirstLevel * 25));
  const maxHealth = Math.min(1000, 100 + (healthLevel * 25));

  const stats = [
    { name: 'health' as const, label: 'Health', value: playerStats.health, max: maxHealth },
    { name: 'hunger' as const, label: 'Hunger', value: playerStats.hunger, max: maxHunger },
    { name: 'thirst' as const, label: 'Thirst', value: playerStats.thirst, max: maxThirst },
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-4 gap-x-2 sm:gap-x-4 w-full sm:w-auto items-end">
        {stats.map(({ name, label, value, max }) => (
          <Tooltip key={name}>
            <TooltipTrigger asChild>
              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                        {statIcons[name]}
                        <span className="font-medium hidden sm:inline">{label}</span>
                    </div>
                    <span className="font-mono text-primary">{Math.round(value)}</span>
                </div>
                <Progress value={(value / max) * 100} className="h-2" indicatorClassName={
                  value < (max * 0.2) ? 'bg-destructive' : 'bg-primary'
                } />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{label}: {Math.round(value)} / {max}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        {/* Energy Stat */}
        <Tooltip>
            <TooltipTrigger asChild>
            <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                        {statIcons['energy']}
                        <span className="font-medium hidden sm:inline">Energy</span>
                    </div>
                    <span className="font-mono text-primary">{Math.round(playerStats['energy'])}</span>
                </div>
                <Progress value={(playerStats['energy'] / maxEnergy) * 100} className="h-2" indicatorClassName={
                playerStats['energy'] < (maxEnergy * 0.2) ? 'bg-destructive' : 'bg-primary'
                } />
            </div>
            </TooltipTrigger>
            <TooltipContent>
            <p>Energy: {Math.round(playerStats['energy'])} / {maxEnergy}</p>
            </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
