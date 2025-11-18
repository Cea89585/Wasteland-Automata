// src/components/game/CraftingPanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { recipes } from '@/lib/game-data/recipes';
import { allIcons, resourceIcons } from './GameIcons';
import { itemData } from '@/lib/game-data/items';
import type { Resource } from '@/lib/game-types';
import { Hammer } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { locationOrder } from '@/lib/game-types';

export default function CraftingPanel() {
  const { gameState, dispatch } = useGame();
  const { inventory, unlockedRecipes, unlockedLocations } = gameState;

  const allLocationsUnlocked = unlockedLocations.length >= locationOrder.length;

  // Filter out items that are now built in the Base panel
  const availableRecipes = recipes.filter(r => 
    unlockedRecipes.includes(r.id) && 
    r.id !== 'recipe_workbench' &&
    r.id !== 'recipe_waterPurifier' &&
    r.id !== 'recipe_furnace' &&
    r.id !== 'recipe_droneBay' &&
    r.id !== 'recipe_hydroponicsBay' &&
    !(r.id === 'recipe_crudeMap' && allLocationsUnlocked) // Hide map if all locations are unlocked
  );

  const canCraft = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return false;
    for (const [resource, amount] of Object.entries(recipe.requirements)) {
      if (inventory[resource as Resource] < amount) {
        return false;
      }
    }
    return true;
  };
  
  const isBusy = gameState.isResting;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crafting</CardTitle>
        <CardDescription>Use resources to craft new tools and structures.</CardDescription>
      </CardHeader>
      <CardContent>
        {!gameState.builtStructures.includes('workbench') ? (
          <p className="text-muted-foreground">You need to build a workbench in your base to unlock most crafting recipes.</p>
        ) : availableRecipes.length === 0 ? (
           <p className="text-muted-foreground">No recipes unlocked. Explore to find more.</p>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2 pr-4">
            {availableRecipes.map(recipe => {
              const isCraftable = canCraft(recipe.id);
              return (
                <Card key={recipe.id} className="bg-muted/50">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-grow">
                        <div className="flex items-center font-semibold text-base mb-2">
                          {allIcons[recipe.creates]} {recipe.name}
                        </div>
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                          <span>Requires:</span>
                          <div className="flex flex-wrap gap-x-3 gap-y-1">
                            {Object.entries(recipe.requirements).map(([resource, amount]) => (
                              <span key={resource} className="flex items-center">
                                {resourceIcons[resource as Resource]}
                                {itemData[resource as Resource].name}: {amount}
                              </span>
                            ))}
                          </div>
                        </div>
                    </div>
                    <Button 
                      size="icon"
                      variant={isCraftable ? 'default' : 'outline'}
                      onClick={() => dispatch({ type: 'CRAFT', payload: { recipeId: recipe.id }})} 
                      disabled={!isCraftable || gameState.playerStats.health <= 0 || isBusy}
                      aria-label={`Craft ${recipe.name}`}
                    >
                      <Hammer className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}