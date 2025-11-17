// src/components/game/InventoryPanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { itemData } from '@/lib/game-data/items';
import { allIcons } from './GameIcons';
import { ScrollArea } from '../ui/scroll-area';

export default function InventoryPanel() {
  const { gameState: { inventory } } = useGame();

  const ownedItems = Object.entries(inventory)
    .filter(([, quantity]) => quantity > 0)
    .map(([id]) => id);

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
                  return (
                    <div key={itemId} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                      <div className="flex items-center">
                        {allIcons[itemId]}
                        <span className="font-medium">{data.name}</span>
                      </div>
                      <span className="font-mono text-lg font-semibold text-primary">{inventory[itemId as keyof typeof inventory]}</span>
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
