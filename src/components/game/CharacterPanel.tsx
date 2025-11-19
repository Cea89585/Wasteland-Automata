// src/components/game/CharacterPanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { itemData } from '@/lib/game-data/items';
import { allIcons } from './GameIcons';
import type { EquipmentSlot, Item } from '@/lib/game-types';
import { Button } from '../ui/button';
import { Shirt, Hand, PersonStanding, Map, Edit, Save, RefreshCw, Loader2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { locations } from '@/lib/game-data/locations';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { firstNames, surnames } from '@/lib/game-data/names';


const NameEditor = () => {
    const { gameState, dispatch } = useGame();
    const { characterName } = gameState;
    const [name, setName] = useState(characterName);
    const [isEditing, setIsEditing] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setName(characterName);
    }, [characterName]);

    const handleSave = async () => {
        if (name.length < 3 || name.length > 25) {
            toast({ variant: 'destructive', title: 'Invalid Name', description: 'Name must be between 3 and 25 characters.' });
            return;
        }
        dispatch({ type: 'SET_CHARACTER_NAME', payload: name });
        setIsEditing(false);
        toast({ title: 'Name Updated', description: `You are now known as ${name}.` });
    };

    const handleRandomize = async () => {
        const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const randomSurname = surnames[Math.floor(Math.random() * surnames.length)];
        setName(`${randomFirstName} ${randomSurname}`);
    };

    if (isEditing) {
        return (
            <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 w-full">
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                    <Button size="icon" onClick={handleRandomize}>
                        <RefreshCw />
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleSave} disabled={name === characterName}>
                        <Save className="mr-2" />
                        Save
                    </Button>
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-primary">{characterName}</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                <Edit />
            </Button>
        </div>
    )
}

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

  const discoveredLocations = gameState.unlockedLocations.slice(1); // Exclude starting location

  return (
    <Card>
      <CardHeader>
        <CardTitle>Character</CardTitle>
        <CardDescription>Equip items to gain bonuses and abilities.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center gap-4">
            <PersonStanding className="h-24 w-24 text-primary/50" />
            <NameEditor />
        </div>
        <Separator />
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
        {discoveredLocations.length > 0 && (
            <>
                <Separator className="my-4" />
                <div className="space-y-2">
                    <h3 className="text-lg font-medium text-muted-foreground">Discoveries</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {discoveredLocations.map((locationId) => (
                             <div key={locationId} className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                                <Map className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <div className="flex flex-col">
                                    <span className="font-medium">{locations[locationId].name} Travel</span>
                                    <p className="text-xs text-muted-foreground">You can now travel to this location from the Explore panel.</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        )}
      </CardContent>
    </Card>
  );
}
