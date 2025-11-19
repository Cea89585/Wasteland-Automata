// src/components/game/SilverCounter.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent } from '@/components/ui/card';
import { Coins } from 'lucide-react';

export default function SilverCounter() {
    const { gameState, dispatch } = useGame();
    const { inventory } = gameState;

    const handleSilverClick = () => {
        // This is a debug/cheat function for testing purposes.
        dispatch({ type: 'CHEAT_ADD_SILVER', payload: { amount: 10000 } });
    }

    return (
        <Card onClick={handleSilverClick} className="cursor-pointer hover:bg-muted/50 transition-colors">
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
