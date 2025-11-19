// src/components/game/CraftingPanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { recipes as allRecipes } from '@/lib/game-data/recipes';
import { allIcons, resourceIcons } from './GameIcons';
import { itemData } from '@/lib/game-data/items';
import type { Resource } from '@/lib/game-types';
import { Hammer, PackageCheck } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { locationOrder } from '@/lib/game-types';
import { useMemo } from 'react';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '../ui/tooltip';


export default function CraftingPanel() {
  const { gameState, dispatch } = useGame();
  const { inventory, unlockedRecipes, unlockedLocations, builtStructures, inventory: inv } = gameState;

  const allLocationsUnlocked = unlockedLocations.length >= locationOrder.length;

  const recipes = useMemo(() => {
    let currentMapCostMultiplier = Math.max(1, unlockedLocations.length - 1);

    return allRecipes.map(recipe => {
      if (recipe.id === 'recipe_crudeMap') {
        const newReqs: Partial<Record<Resource | 'silver', number>> = {};
        for (const [resource, amount] of Object.entries(recipe.requirements)) {
            if (resource === 'silver') {
                newReqs.silver = Math.floor(amount * Math.pow(currentMapCostMultiplier, 1.2));
            } else {
                newReqs[resource as Resource] = Math.floor(amount * Math.pow(currentMapCostMultiplier, 1.5));
            }
        }
        return { ...recipe, requirements: newReqs };
      }
      return recipe;
    });
  }, [unlockedLocations.length]);

  // Filter out items that are now built in the Base panel
  const availableRecipes = recipes.filter(r => 
    unlockedRecipes.includes(r.id) && 
    r.id !== 'recipe_workbench' &&
    r.id !== 'recipe_waterPurifier' &&
    r.id !== 'recipe_furnace' &&
    r.id !== 'recipe_droneBay' &&
    r.id !== 'recipe_hydroponicsBay' &&
    !(r.id === 'recipe_biomassCompressor' && inv.biomassCompressor > 0) &&
    r.id !== 'recipe_crudeMap' && // Hide the old map recipe
    !(r.creates === 'crudeMap' && allLocationsUnlocked) // Hide all map recipes if all locations are unlocked
  );

  const calculateMaxCraftable = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return 0;
    
    let maxCraftable = Infinity;
    for (const [resource, amount] of Object.entries(recipe.requirements)) {
        const available = inventory[resource as keyof typeof inventory] || 0;
        const potential = Math.floor(available / amount);
        if (potential < maxCraftable) {
            maxCraftable = potential;
        }
    }
    return maxCraftable === Infinity ? 0 : maxCraftable;
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
          <div className="space-y-2">
            {availableRecipes.map(recipe => {
              const maxCraftable = calculateMaxCraftable(recipe.id);
              const isCraftable = maxCraftable > 0;
              return (
                <Card key={recipe.id} className="bg-muted/50">
                  <CardContent className="p-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="flex-grow w-full">
                        <div className="flex items-center font-semibold text-base mb-2">
                          {allIcons[recipe.creates]} {recipe.name}
                        </div>
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                          <span>Requires:</span>
                          <div className="flex flex-wrap gap-x-3 gap-y-1">
                            {Object.entries(recipe.requirements).map(([resource, amount]) => (
                              <span key={resource} className="flex items-center">
                                {resourceIcons[resource as Resource] || allIcons.silver}
                                {itemData[resource as keyof typeof itemData].name}: {amount}
                              </span>
                            ))}
                          </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button 
                            className="flex-1"
                            variant={isCraftable ? 'default' : 'outline'}
                            onClick={() => dispatch({ type: 'CRAFT', payload: { recipeId: recipe.id }})} 
                            disabled={!isCraftable || gameState.playerStats.health <= 0 || isBusy}
                            aria-label={`Craft ${recipe.name}`}
                        >
                            <Hammer className="h-4 w-4" />
                            Craft
                        </Button>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex-1">
                                        <Button 
                                            className="w-full"
                                            variant="secondary"
                                            onClick={() => dispatch({ type: 'CRAFT_ALL', payload: { recipeId: recipe.id, amount: maxCraftable }})} 
                                            disabled={maxCraftable < 2 || gameState.playerStats.health <= 0 || isBusy}
                                            aria-label={`Craft all ${recipe.name}`}
                                        >
                                            <PackageCheck className="h-4 w-4" />
                                            Craft All ({maxCraftable})
                                        </Button>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {maxCraftable < 2 ? <p>You need enough resources for at least 2 items.</p> : <p>Craft all possible items.</p>}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
