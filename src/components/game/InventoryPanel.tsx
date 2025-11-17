// src/components/game/InventoryPanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { itemData } from '@/lib/game-data/items';
import { allIcons } from './GameIcons';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Apple, GlassWater, Zap, Shirt } from 'lucide-react';
import type { Item } from '@/lib/game-types';

export default function InventoryPanel() {
  const { gameState, dispatch } = useGame();
  const { inventory, equipment } = gameState;

  const consumableSortOrder = ['apple', 'water', 'cookedApple'];

  const ownedItems = Object.entries(inventory)
    .filter(([id, quantity]) => quantity > 0 && id !== 'silver')
    .map(([id]) => id)
    .sort((a, b) => {
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

  const handleEat = () => {
    if (inventory.apple > 0) {
      dispatch({ type: 'EAT' });
    }
  };

  const handleDrink = () => {
    if (inventory.water > 0) {
      dispatch({ type: 'DRINK' });
    }
  };

  const handleEatCookedApple = () => {
    if (inventory.cookedApple > 0) {
        dispatch({ type: 'EAT_COOKED_APPLE' });
    }
  }

  const handleEquip = (itemId: Item) => {
    const itemDetails = itemData[itemId];
    if (itemDetails && itemDetails.equipSlot) {
      dispatch({ type: 'EQUIP', payload: { item: itemId, slot: itemDetails.equipSlot } });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        {ownedItems.length === 0 ? (
          <p className="text-muted-foreground">Your inventory is empty. Time to start scavenging.</p>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ownedItems.map((itemId) => {
                  const data = itemData[itemId as keyof typeof itemData];
                  const isEquippable = data && data.equipSlot; // Check if it has any equip slot
                  const equippedItemInSlot = data.equipSlot ? equipment[data.equipSlot] : null;
                  const isEquipped = equippedItemInSlot === itemId;

                  return (
                    <div key={itemId} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                      <div className="flex items-center">
                        {allIcons[itemId]}
                        <div className="flex flex-col">
                            <span className="font-medium">{data?.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-semibold text-primary">{inventory[itemId as keyof typeof inventory]}</span>
                        {itemId === 'apple' && (
                            <Button size="icon" variant="outline" onClick={handleEat} disabled={isDead || inventory.apple === 0 || isBusy} aria-label="Eat apple">
                                <Apple className="h-4 w-4" />
                            </Button>
                        )}
                        {itemId === 'water' && (
                            <Button size="icon" variant="outline" onClick={handleDrink} disabled={isDead || inventory.water === 0 || isBusy} aria-label="Drink water">
                                <GlassWater className="h-4 w-4" />
                            </Button>
                        )}
                        {itemId === 'cookedApple' && (
                            <Button size="icon" variant="outline" onClick={handleEatCookedApple} disabled={isDead || inventory.cookedApple === 0 || isBusy} aria-label="Eat Cooked Apple">
                                <Zap className="h-4 w-4" />
                            </Button>
                        )}
                        {isEquippable && !isEquipped &&(
                             <Button size="icon" variant="outline" onClick={() => handleEquip(itemId as Item)} disabled={isDead || isBusy} aria-label={`Equip ${data.name}`}>
                                <Shirt className="h-4 w-4" />
                            </Button>
                        )}
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
