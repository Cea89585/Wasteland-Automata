// src/components/game/SilverCounter.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent } from '@/components/ui/card';
import { Coins } from 'lucide-react';

export default function SilverCounter() {
    const { gameState } = useGame();
    const { inventory } = gameState;

    return (
        <Card>
            <CardContent className="p-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs font-semibold">Silver</span>
                </div>
                <span className="text-base font-bold font-mono text-primary">
                    {inventory.silver || 0}
                </span>
            </CardContent>
        </Card>
    );
}
