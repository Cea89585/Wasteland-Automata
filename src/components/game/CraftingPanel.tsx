// src/components/game/CraftingPanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { recipes as allRecipes } from '@/lib/game-data/recipes';
import { GameIcon } from '@/lib/icon-mapping';
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
    r.id !== 'recipe_generator' &&
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
              const hasResourceIntuition = (gameState.skills.resourceIntuition || 0) > 0;
              const highlightClass = (hasResourceIntuition && isCraftable) ? 'border-primary border-2' : 'bg-muted/50';

              return (
                <Card key={recipe.id} className={`${highlightClass}`}>
                  <CardContent className="p-4 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex-grow w-full">
                        <div className="flex items-center font-semibold text-base mb-2 gap-2">
                          <GameIcon type="item" id={recipe.creates} size={20} /> {recipe.name}
                        </div>
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="text-muted-foreground">Requires:</span>
                          <div className="flex flex-wrap gap-x-3 gap-y-1">
                            {Object.entries(recipe.requirements).map(([resource, amount]) => {
                              const has = inventory[resource as keyof typeof inventory] || 0;
                              const enough = has >= amount;
                              return (
                                <span key={resource} className={enough ? 'text-green-600' : 'text-red-600'}>
                                  <GameIcon type="item" id={resource} size={16} className="inline" />
                                  {itemData[resource as keyof typeof itemData].name}: {has}/{amount}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                        <Button
                          className="flex-1"
                          variant={isCraftable ? 'default' : 'outline'}
                          onClick={() => dispatch({ type: 'CRAFT', payload: { recipeId: recipe.id } })}
                          disabled={!isCraftable || gameState.playerStats.health <= 0 || isBusy}
                          aria-label={`Craft ${recipe.name}`}
                        >
                          <Hammer className="h-4 w-4" />
                          Craft
                        </Button>

                        {/* Bulk Crafter Skill Buttons */}
                        {(() => {
                          const bulkCrafterLevel = gameState.skills.bulkCrafter || 0;

                          if (bulkCrafterLevel >= 1) {
                            const craft5Amount = Math.min(5, maxCraftable);
                            const canCraft5 = maxCraftable >= 5;

                            return (
                              <Button
                                className="flex-1"
                                variant="secondary"
                                onClick={() => dispatch({ type: 'CRAFT_ALL', payload: { recipeId: recipe.id, amount: 5 } })}
                                disabled={!canCraft5 || gameState.playerStats.health <= 0 || isBusy}
                              >
                                Craft 5
                              </Button>
                            );
                          }
                          return null;
                        })()}

                        {(() => {
                          const bulkCrafterLevel = gameState.skills.bulkCrafter || 0;

                          if (bulkCrafterLevel >= 2) {
                            const craft10Amount = Math.min(10, maxCraftable);
                            const canCraft10 = maxCraftable >= 10;

                            return (
                              <Button
                                className="flex-1"
                                variant="secondary"
                                onClick={() => dispatch({ type: 'CRAFT_ALL', payload: { recipeId: recipe.id, amount: 10 } })}
                                disabled={!canCraft10 || gameState.playerStats.health <= 0 || isBusy}
                              >
                                Craft 10
                              </Button>
                            );
                          }
                          return null;
                        })()}

                        {(() => {
                          const bulkCrafterLevel = gameState.skills.bulkCrafter || 0;

                          if (bulkCrafterLevel >= 3) {
                            return (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex-1">
                                      <Button
                                        className="w-full"
                                        variant="secondary"
                                        onClick={() => dispatch({ type: 'CRAFT_ALL', payload: { recipeId: recipe.id, amount: maxCraftable } })}
                                        disabled={maxCraftable < 2 || gameState.playerStats.health <= 0 || isBusy}
                                        aria-label={`Craft all ${recipe.name}`}
                                      >
                                        <PackageCheck className="h-4 w-4" />
                                        Craft Max ({maxCraftable})
                                      </Button>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {maxCraftable < 2 ? <p>You need enough resources for at least 2 items.</p> : <p>Craft all possible items.</p>}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>

                    {/* Mastery Section */}
                    {(() => {
                      const crafts = gameState.statistics.itemsCrafted?.[recipe.creates] || 0;
                      const claimedTier = gameState.masteryClaimed?.[recipe.creates] || 0;
                      const nextTier = claimedTier + 1;
                      const requiredCrafts = Math.pow(10, nextTier);
                      const progress = Math.min(100, (crafts / requiredCrafts) * 100);
                      const canClaim = crafts >= requiredCrafts;

                      return (
                        <div className="w-full space-y-1 pt-2 border-t border-border/50">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Mastery Tier {claimedTier}</span>
                            <span>{crafts} / {requiredCrafts} Crafted</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={progress} className="h-2 flex-grow" />
                            {canClaim && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-xs border-yellow-500 text-yellow-500 hover:text-yellow-400"
                                onClick={() => dispatch({ type: 'CLAIM_MASTERY_REWARD', payload: { itemId: recipe.creates, tier: nextTier } })}
                              >
                                Claim Tier {nextTier}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })()}
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
