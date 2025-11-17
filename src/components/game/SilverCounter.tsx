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
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Coins className="h-6 w-6 text-yellow-500" />
                    <span className="text-lg font-semibold">Silver</span>
                </div>
                <span className="text-xl font-bold font-mono text-primary">
                    {inventory.silver}
                </span>
            </CardContent>
        </Card>
    );
}
