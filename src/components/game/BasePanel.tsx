// src/components/game/BasePanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Hammer, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { recipes } from '@/lib/game-data/recipes';
import type { Resource } from '@/lib/game-types';
import { resourceIcons } from './GameIcons';
import { itemData } from '@/lib/game-data/items';

export default function BasePanel() {
  const { gameState, dispatch } = useGame();

  const workbenchRecipe = recipes.find(r => r.id === 'recipe_workbench');
  const isWorkbenchBuilt = gameState.builtStructures.includes('workbench');
  const isBusy = gameState.isResting;

  const canCraftWorkbench = () => {
    if (!workbenchRecipe) return false;
    for (const [resource, amount] of Object.entries(workbenchRecipe.requirements)) {
      if (gameState.inventory[resource as Resource] < amount) {
        return false;
      }
    }
    return true;
  };

  const handleBuildWorkbench = () => {
    dispatch({ type: 'BUILD_STRUCTURE', payload: { recipeId: 'recipe_workbench' } });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Base</CardTitle>
        <CardDescription>A small patch of wasteland to call your own.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center text-center">
        {!isWorkbenchBuilt && workbenchRecipe ? (
          <Card className="bg-muted/50 p-6 w-full">
            <CardTitle className="flex items-center justify-center text-xl mb-4">
              <Home className="mr-2 h-6 w-6" /> Build a Workbench
            </CardTitle>
            <CardDescription className="mb-4">
              A workbench is essential for unlocking more advanced crafting recipes.
            </CardDescription>
            <div className="flex flex-col gap-2 text-sm my-4 items-start mx-auto max-w-xs">
                <span className="font-semibold text-muted-foreground self-center">Requires:</span>
                <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
                    {Object.entries(workbenchRecipe.requirements).map(([resource, amount]) => (
                    <span key={resource} className="flex items-center">
                        {resourceIcons[resource as Resource]}
                        {itemData[resource as Resource].name}: {amount}
                    </span>
                    ))}
                </div>
            </div>
            <Button 
                onClick={handleBuildWorkbench} 
                disabled={!canCraftWorkbench() || gameState.playerStats.health <= 0 || isBusy}
                className="w-full sm:w-auto mt-4"
              >
                <Hammer className="mr-2 h-4 w-4" />
                Build
            </Button>
          </Card>
        ) : (
            <div className="flex flex-col items-center justify-center text-center h-48">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <p className="mt-4 text-lg font-semibold">Workbench built!</p>
                <p className="text-muted-foreground">Advanced crafting recipes are now available.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
