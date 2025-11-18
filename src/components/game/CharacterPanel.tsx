// src/components/game/CharacterPanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { itemData } from '@/lib/game-data/items';
import { allIcons } from './GameIcons';
import type { EquipmentSlot, Item } from '@/lib/game-types';
import { Button } from '../ui/button';
import { Shirt, Hand, PersonStanding, Map } from 'lucide-react';
import { Separator } from '../ui/separator';

const slotIcons: Record<EquipmentSlot, React.ReactElement> = {
    hand: <Hand className="h-6 w-6 text-muted-foreground" />,
    body: <Shirt className="h-6 w-6 text-muted-foreground" />,
};

const slotNames: Record<EquipmentSlot, string> = {
    hand: 'Hand',
    body: 'Body',
}

export default function CharacterPanel() {
  const { gameState, dispatch } = useGame();
  const { equipment } = gameState;

  const handleUnequip = (slot: EquipmentSlot) => {
    dispatch({ type: 'UNEQUIP', payload: { slot } });
  };

  const isDead = gameState.playerStats.health <= 0;
  const isBusy = gameState.isResting;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Character</CardTitle>
        <CardDescription>Equip items to gain bonuses and abilities.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center">
            <PersonStanding className="h-24 w-24 text-primary/50" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.keys(equipment) as EquipmentSlot[]).map((slot) => {
            const equippedItem = equipment[slot];
            const itemDetails = equippedItem ? itemData[equippedItem] : null;

            return (
              <Card key={slot} className="bg-muted/50">
                <CardHeader className='pb-2'>
                  <CardTitle className="flex items-center text-lg gap-2">
                    {slotIcons[slot]} {slotNames[slot]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-between min-h-[6rem]">
                  {equippedItem && itemDetails ? (
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-2 font-semibold text-primary">
                        {allIcons[equippedItem]}
                        <span>{itemDetails.name}</span>
                       </div>
                       <p className="text-xs text-muted-foreground">{itemDetails.description}</p>
                       <Button variant="outline" size="sm" className="mt-2" onClick={() => handleUnequip(slot)} disabled={isDead || isBusy}>
                         Unequip
                       </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground">Empty</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        {gameState.unlockedFlags.includes('mapCrafted') && (
            <>
                <Separator className="my-4" />
                <div className="space-y-2">
                    <h3 className="text-lg font-medium text-muted-foreground">Discoveries</h3>
                    <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                        {allIcons['crudeMap']}
                        <div className="flex flex-col">
                            <span className="font-medium">Crude Map</span>
                            <p className="text-xs text-muted-foreground">Wasteland travel unlocked.</p>
                        </div>
                    </div>
                </div>
            </>
        )}
      </CardContent>
    </Card>
  );
}
