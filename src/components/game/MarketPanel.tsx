// src/components/game/MarketPanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { itemData } from '@/lib/game-data/items';
import { allIcons } from './GameIcons';
import { ScrollArea } from '../ui/scroll-area';
import { Coins, Lock, Unlock, ShoppingBag } from 'lucide-react';
import type { Resource } from '@/lib/game-types';

export default function MarketPanel() {
  const { gameState, dispatch } = useGame();
  const { inventory, lockedItems } = gameState;

  const sellableItems = Object.entries(inventory)
    .filter(([itemId, quantity]) => {
      const data = itemData[itemId as keyof typeof itemData];
      return quantity > 0 && data?.sellPrice;
    })
    .map(([itemId, quantity]) => ({
      id: itemId as Resource,
      quantity,
      ...itemData[itemId as keyof typeof itemData]
    }));

  const handleSell = (item: Resource, amount: number) => {
    const price = itemData[item]?.sellPrice;
    if (price === undefined) return;
    dispatch({ type: 'SELL_ITEM', payload: { item, amount, price } });
  }

  const handleSellAll = () => {
    dispatch({ type: 'SELL_ALL_UNLOCKED' });
  }

  const toggleLockItem = (item: Resource) => {
    dispatch({ type: 'TOGGLE_LOCK_ITEM', payload: { item } });
  }

  const isDead = gameState.playerStats.health <= 0;
  const isBusy = gameState.isResting || gameState.isSmelting;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
            <CardTitle>Wandering Trader</CardTitle>
            <CardDescription>Sell your excess goods for silver.</CardDescription>
        </div>
        <Button onClick={handleSellAll} disabled={isDead || isBusy}>
            <ShoppingBag className="mr-2" />
            Sell All Unlocked
        </Button>
      </CardHeader>
      <CardContent>
        {sellableItems.length === 0 ? (
          <p className="text-muted-foreground">You have nothing of value to sell. Go find some loot.</p>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="grid grid-cols-1 gap-4">
              {sellableItems.map((item) => {
                const isLocked = lockedItems.includes(item.id);
                return (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                    <div className="flex items-center">
                        {allIcons[item.id]}
                        <div className="flex flex-col">
                            <span className="font-medium">{item.name}</span>
                            <div className="flex items-center text-xs text-muted-foreground">
                                <Coins className="h-3 w-3 mr-1 text-yellow-500" />
                                <span>{item.sellPrice} each</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-semibold text-primary">{item.quantity}</span>
                        <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleSell(item.id, 1)}
                        disabled={isDead || isBusy || isLocked}
                        aria-label={`Sell 1 ${item.name}`}
                        >
                        Sell
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => toggleLockItem(item.id)}
                            disabled={isDead || isBusy}
                            aria-label={isLocked ? `Unlock ${item.name}` : `Lock ${item.name}`}
                        >
                            {isLocked ? <Lock className="h-4 w-4 text-primary" /> : <Unlock className="h-4 w-4" />}
                        </Button>
                    </div>
                    </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
