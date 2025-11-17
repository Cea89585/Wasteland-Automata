// src/components/game/StatsPanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Progress } from '@/components/ui/progress';
import { statIcons } from './GameIcons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function StatsPanel() {
  const { gameState: { playerStats } } = useGame();

  const stats: { name: keyof typeof playerStats; label: string }[] = [
    { name: 'health', label: 'Health' },
    { name: 'hunger', label: 'Hunger' },
    { name: 'thirst', label: 'Thirst' },
    { name: 'energy', label: 'Energy' },
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 w-full sm:w-auto">
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
      </div>
    </TooltipProvider>
  );
}
