// src/components/game/StatsPanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Progress } from '@/components/ui/progress';
import { statIcons } from './GameIcons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '../ui/button';
import { Zap } from 'lucide-react';

export default function StatsPanel() {
  const { gameState: { playerStats }, dispatch } = useGame();

  const handleRefillEnergy = () => {
    dispatch({ type: 'REGEN_ENERGY', payload: { amount: 100 } });
  };

  const stats: { name: keyof Omit<typeof playerStats, 'energy'>; label: string }[] = [
    { name: 'health', label: 'Health' },
    { name: 'hunger', label: 'Hunger' },
    { name: 'thirst', label: 'Thirst' },
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 w-full sm:w-auto items-end">
        {stats.map(({ name, label }) => (
          <Tooltip key={name}>
            <TooltipTrigger asChild>
              <div className="flex flex-col gap-1 w-24">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                        {statIcons[name]}
                        <span className="font-medium">{label}</span>
                    </div>
                    <span className="font-mono text-primary">{Math.round(playerStats[name])}%</span>
                </div>
                <Progress value={playerStats[name]} className="h-2" indicatorClassName={
                  playerStats[name] < 20 ? 'bg-destructive' : 'bg-primary'
                } />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{label}: {Math.round(playerStats[name])}%</p>
            </TooltipContent>
          </Tooltip>
        ))}
        {/* Energy Stat with Button */}
        <div className="flex items-center gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                <div className="flex flex-col gap-1 w-24">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center">
                            {statIcons['energy']}
                            <span className="font-medium">Energy</span>
                        </div>
                        <span className="font-mono text-primary">{Math.round(playerStats['energy'])}%</span>
                    </div>
                    <Progress value={playerStats['energy']} className="h-2" indicatorClassName={
                    playerStats['energy'] < 20 ? 'bg-destructive' : 'bg-primary'
                    } />
                </div>
                </TooltipTrigger>
                <TooltipContent>
                <p>Energy: {Math.round(playerStats['energy'])}%</p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRefillEnergy}>
                        <Zap className="h-4 w-4 text-yellow-500" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Dev: Refill Energy</p>
                </TooltipContent>
            </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
