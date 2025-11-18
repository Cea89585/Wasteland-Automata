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
                <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm font-semibold">Silver</span>
                </div>
                <span className="text-lg font-bold font-mono text-primary">
                    {inventory.silver || 0}
                </span>
            </CardContent>
        </Card>
    );
}
