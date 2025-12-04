// src/components/game/MarketPanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { itemData } from '@/lib/game-data/items';
import { GameIcon } from '@/lib/icon-mapping';
import { Separator } from '@/components/ui/separator';
import { Coins, Lock, Unlock, ShoppingBag } from 'lucide-react';
import type { Resource } from '@/lib/game-types';

export default function MarketPanel() {
  const { gameState, dispatch } = useGame();
  const { inventory, lockedItems, caughtFish } = gameState;

  // Combine regular inventory items with caught fish
  const inventoryItems = Object.entries(inventory)
    .filter(([itemId, quantity]) => {
      const data = itemData[itemId as keyof typeof itemData];
      return quantity > 0 && data?.sellPrice;
    })
    .map(([itemId, quantity]) => ({
      id: itemId as Resource,
      quantity,
      isFish: false,
      ...itemData[itemId as keyof typeof itemData]
    }));

  const fishItems = Object.entries(caughtFish || {})
    .filter(([fishId, quantity]) => {
      const data = itemData[fishId];
      return quantity && quantity > 0 && data?.sellPrice;
    })
    .map(([fishId, quantity]) => ({
      id: fishId as Resource,
      quantity: quantity!,
      isFish: true,
      ...itemData[fishId]
    }));

  const sellableItems = [...inventoryItems, ...fishItems];

  const unlockedSellableItems = sellableItems.filter(item => !lockedItems.includes(item.id));
  const lockedSellableItems = sellableItems.filter(item => lockedItems.includes(item.id));


  const handleSell = (item: Resource, amount: number, isFish: boolean) => {
    const price = itemData[item]?.sellPrice;
    if (price === undefined) return;

    if (isFish) {
      // Sell fish using SELL_ALL_FISH action (we'll need to modify this to sell individual fish)
      // For now, we'll use the same SELL_ITEM action
      dispatch({ type: 'SELL_ITEM', payload: { item, amount, price } });
    } else {
      dispatch({ type: 'SELL_ITEM', payload: { item, amount, price } });
    }
  }

  const handleSellAll = () => {
    dispatch({ type: 'SELL_ALL_UNLOCKED' });
    // Also sell all unlocked fish
    dispatch({ type: 'SELL_ALL_FISH' });
  }

  const toggleLockItem = (item: Resource) => {
    dispatch({ type: 'TOGGLE_LOCK_ITEM', payload: { item } });
  }

  const isDead = gameState.playerStats.health <= 0;
  const isBusy = gameState.isResting || gameState.smeltingQueue > 0;

  const renderItem = (item: typeof sellableItems[0]) => {
    const isLocked = lockedItems.includes(item.id);
    return (
      <div key={item.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
        <div className="flex items-center gap-3">
          <GameIcon type="item" id={item.id} size={24} className="flex-shrink-0" />
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
            onClick={() => handleSell(item.id, 1, item.isFish)}
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
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle>Wandering Trader</CardTitle>
          <CardDescription>Sell your excess goods and fish for silver.</CardDescription>
        </div>
        <Button onClick={handleSellAll} disabled={isDead || isBusy} className="w-full sm:w-auto">
          <ShoppingBag className="mr-2" />
          Sell All Unlocked
        </Button>
      </CardHeader>
      <CardContent>
        {sellableItems.length === 0 ? (
          <p className="text-muted-foreground">You have nothing of value to sell. Go find some loot.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {unlockedSellableItems.map(renderItem)}

            {unlockedSellableItems.length > 0 && lockedSellableItems.length > 0 && (
              <Separator />
            )}

            {lockedSellableItems.map(renderItem)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
