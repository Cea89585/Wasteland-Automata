// src/components/game/InventoryPanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { itemData } from '@/lib/game-data/items';
import { GameIcon, AppleIcon, WaterIcon, CookedAppleIcon } from '@/lib/icon-mapping';
import { Button } from '../ui/button';
import { Shirt, Flame } from 'lucide-react';
import type { Item } from '@/lib/game-types';

export default function InventoryPanel() {
  const { gameState, dispatch } = useGame();
  const { inventory, equipment, caughtFish } = gameState;

  const consumableSortOrder = ['apple', 'water', 'cookedApple', 'cookedFish', 'cornChowder', 'vegetableMedley', 'fruitSalad', 'lemonade'];

  // Get owned inventory items
  const ownedInventoryItems = Object.entries(inventory)
    .filter(([id, quantity]) => quantity > 0 && id !== 'silver')
    .map(([id]) => id);

  // Get owned fish
  const ownedFish = Object.entries(caughtFish || {})
    .filter(([_, quantity]) => quantity && quantity > 0)
    .map(([id]) => id);

  // Combine all items
  const allOwnedItems = [...ownedInventoryItems, ...ownedFish];

  // Sort items
  const ownedItems = allOwnedItems.sort((a, b) => {
    const aIndex = consumableSortOrder.indexOf(a);
    const bIndex = consumableSortOrder.indexOf(b);

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });

  const isDead = gameState.playerStats.health <= 0;
  const isBusy = gameState.isResting;

  const handleUseItem = (itemId: string) => {
    // Check if it's a basic item with a legacy handler
    if (itemId === 'apple') {
      dispatch({ type: 'EAT' });
    } else if (itemId === 'water') {
      dispatch({ type: 'DRINK' });
    } else if (itemId === 'cookedApple') {
      dispatch({ type: 'EAT_COOKED_APPLE' });
    } else {
      // Use the new generic handler
      dispatch({ type: 'USE_ITEM', payload: { itemId } });
    }
  };

  const handleEquip = (itemId: Item) => {
    const itemDetails = itemData[itemId];
    if (itemDetails && itemDetails.equipSlot) {
      dispatch({ type: 'EQUIP', payload: { item: itemId, slot: itemDetails.equipSlot } });
    }
  }

  // Helper to get quantity for an item (from inventory or caughtFish)
  const getItemQuantity = (itemId: string): number => {
    if (inventory[itemId as keyof typeof inventory]) {
      return inventory[itemId as keyof typeof inventory];
    }
    if (caughtFish && caughtFish[itemId]) {
      return caughtFish[itemId] || 0;
    }
    return 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        {ownedItems.length === 0 ? (
          <p className="text-muted-foreground">Your inventory is empty. Time to start scavenging.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ownedItems.map((itemId) => {
              const data = itemData[itemId as keyof typeof itemData];
              const isEquippable = data && data.equipSlot;
              const equippedItemInSlot = data?.equipSlot ? equipment[data.equipSlot] : null;
              const isEquipped = equippedItemInSlot === itemId;
              const quantity = getItemQuantity(itemId);

              return (
                <div key={itemId} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <div className="flex items-center gap-3">
                    <GameIcon type="item" id={itemId} size={24} className="flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium">{data?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-semibold text-primary">{quantity}</span>
                    {data?.type === 'consumable' && (
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleUseItem(itemId)}
                        disabled={isDead || quantity === 0 || isBusy}
                        aria-label={`Use ${data.name}`}
                      >
                        {itemId === 'apple' ? (
                          <AppleIcon size={16} />
                        ) : itemId === 'water' ? (
                          <WaterIcon size={16} />
                        ) : itemId === 'cookedApple' ? (
                          <CookedAppleIcon size={16} />
                        ) : (
                          <Flame size={16} />
                        )}
                      </Button>
                    )}
                    {isEquippable && !isEquipped && (
                      <Button size="icon" variant="outline" onClick={() => handleEquip(itemId as Item)} disabled={isDead || isBusy} aria-label={`Equip ${data.name}`}>
                        <Shirt className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
