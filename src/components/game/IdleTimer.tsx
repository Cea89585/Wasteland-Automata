// src/components/game/IdleTimer.tsx
'use client';

import { useGame } from '@/hooks/use-game';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Moon } from 'lucide-react';

export default function IdleTimer() {
    const { gameState, idleProgress } = useGame();
    
    if (gameState.isIdle) {
        return (
             <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Moon className="h-4 w-4 text-primary" />
                <span>Resting...</span>
             </div>
        );
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="w-32">
                        <Progress value={100 - idleProgress} className="h-2" />
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Time until auto-rest</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
