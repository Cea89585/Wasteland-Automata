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

export default function CraftingPanel() {
  const { gameState, dispatch } = useGame();
  const { inventory, unlockedRecipes } = gameState;

  // Filter out items that are now built in the Base panel
  const availableRecipes = recipes.filter(r => 
    unlockedRecipes.includes(r.id) && 
    r.id !== 'recipe_workbench' &&
    r.id !== 'recipe_waterPurifier' &&
    r.id !== 'recipe_furnace' &&
    !(r.id === 'recipe_crudeMap' && gameState.unlockedFlags.includes('mapCrafted')) // Hide map if already crafted
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
            <div className="space-y-4 pr-4">
            {availableRecipes.map(recipe => (
              <Card key={recipe.id} className="bg-muted/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg">{allIcons[recipe.creates]} {recipe.name}</CardTitle>
                  <CardDescription>{recipe.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold text-muted-foreground">Requires:</span>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {Object.entries(recipe.requirements).map(([resource, amount]) => (
                        <span key={resource} className="flex items-center">
                          {resourceIcons[resource as Resource]}
                          {itemData[resource as Resource].name}: {amount}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button 
                    onClick={() => dispatch({ type: 'CRAFT', payload: { recipeId: recipe.id }})} 
                    disabled={!canCraft(recipe.id) || gameState.playerStats.health <= 0 || isBusy}
                    className="w-full sm:w-auto"
                  >
                    <Hammer className="mr-2 h-4 w-4" />
                    Craft
                  </Button>
                </CardContent>
              </Card>
            ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
