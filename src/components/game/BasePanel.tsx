// src/components/game/BasePanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Hammer, CheckCircle, Droplets, Power, Bot, Sprout } from 'lucide-react';
import { Button } from '../ui/button';
import { recipes } from '@/lib/game-data/recipes';
import type { Resource } from '@/lib/game-types';
import { resourceIcons } from './GameIcons';
import { itemData } from '@/lib/game-data/items';
import { Separator } from '../ui/separator';

export default function BasePanel() {
  const { gameState, dispatch } = useGame();

  const workbenchRecipe = recipes.find(r => r.id === 'recipe_workbench');
  const waterPurifierRecipe = recipes.find(r => r.id === 'recipe_waterPurifier');
  const furnaceRecipe = recipes.find(r => r.id === 'recipe_furnace');
  const droneBayRecipe = recipes.find(r => r.id === 'recipe_droneBay');
  const hydroponicsBayRecipe = recipes.find(r => r.id === 'recipe_hydroponicsBay');


  const isWorkbenchBuilt = gameState.builtStructures.includes('workbench');
  const isWaterPurifierBuilt = gameState.builtStructures.includes('waterPurifier');
  const isFurnaceBuilt = gameState.builtStructures.includes('furnace');
  const isDroneBayBuilt = gameState.builtStructures.includes('droneBay');
  const isHydroponicsBayBuilt = gameState.builtStructures.includes('hydroponicsBay');
  
  const isBusy = gameState.isResting;

  const canCraft = (recipeId: string | undefined) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return false;
    for (const [resource, amount] of Object.entries(recipe.requirements)) {
      if (gameState.inventory[resource as Resource] < amount) {
        return false;
      }
    }
    return true;
  };

  const handleBuild = (recipeId: string) => {
    dispatch({ type: 'BUILD_STRUCTURE', payload: { recipeId } });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Base</CardTitle>
        <CardDescription>A small patch of wasteland to call your own.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Workbench Section */}
        {!isWorkbenchBuilt && workbenchRecipe ? (
          <Card className="bg-muted/50 p-6 w-full text-center">
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
                onClick={() => handleBuild('recipe_workbench')} 
                disabled={!canCraft('recipe_workbench') || gameState.playerStats.health <= 0 || isBusy}
                className="w-full sm:w-auto mt-4"
              >
                <Hammer className="mr-2 h-4 w-4" />
                Build
            </Button>
          </Card>
        ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 rounded-lg bg-muted/50">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="mt-2 text-lg font-semibold">Workbench built!</p>
                <p className="text-sm text-muted-foreground">Advanced crafting is available.</p>
            </div>
        )}
        
        {/* Water Purifier Section */}
        {isWorkbenchBuilt && !isWaterPurifierBuilt && waterPurifierRecipe ? (
          <Card className="bg-muted/50 p-6 w-full text-center">
            <CardTitle className="flex items-center justify-center text-xl mb-4">
              <Droplets className="mr-2 h-6 w-6" /> Build a Water Purifier
            </CardTitle>
            <CardDescription className="mb-4">
              Passively generates a steady supply of clean drinking water.
            </CardDescription>
            <div className="flex flex-col gap-2 text-sm my-4 items-start mx-auto max-w-xs">
                <span className="font-semibold text-muted-foreground self-center">Requires:</span>
                <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
                    {Object.entries(waterPurifierRecipe.requirements).map(([resource, amount]) => (
                    <span key={resource} className="flex items-center">
                        {resourceIcons[resource as Resource]}
                        {itemData[resource as Resource].name}: {amount}
                    </span>
                    ))}
                </div>
            </div>
            <Button 
                onClick={() => handleBuild('recipe_waterPurifier')} 
                disabled={!canCraft('recipe_waterPurifier') || gameState.playerStats.health <= 0 || isBusy}
                className="w-full sm:w-auto mt-4"
              >
                <Hammer className="mr-2 h-4 w-4" />
                Build
            </Button>
          </Card>
        ) : isWaterPurifierBuilt ? (
            <div className="flex flex-col items-center justify-center text-center p-6 rounded-lg bg-muted/50">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="mt-2 text-lg font-semibold">Water Purifier built!</p>
                <p className="text-sm text-muted-foreground">Passively generating water.</p>
            </div>
        ): null}

        {/* Hydroponics Bay Section */}
        {isWorkbenchBuilt && !isHydroponicsBayBuilt && hydroponicsBayRecipe ? (
          <Card className="bg-muted/50 p-6 w-full text-center">
            <CardTitle className="flex items-center justify-center text-xl mb-4">
              <Sprout className="mr-2 h-6 w-6" /> Build a Hydroponics Bay
            </CardTitle>
            <CardDescription className="mb-4">
              Passively grows a slow but steady supply of edible plants.
            </CardDescription>
            <div className="flex flex-col gap-2 text-sm my-4 items-start mx-auto max-w-xs">
                <span className="font-semibold text-muted-foreground self-center">Requires:</span>
                <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
                    {Object.entries(hydroponicsBayRecipe.requirements).map(([resource, amount]) => (
                    <span key={resource} className="flex items-center">
                        {resourceIcons[resource as Resource]}
                        {itemData[resource as Resource].name}: {amount}
                    </span>
                    ))}
                </div>
            </div>
            <Button 
                onClick={() => handleBuild('recipe_hydroponicsBay')} 
                disabled={!canCraft('recipe_hydroponicsBay') || gameState.playerStats.health <= 0 || isBusy}
                className="w-full sm:w-auto mt-4"
              >
                <Hammer className="mr-2 h-4 w-4" />
                Build
            </Button>
          </Card>
        ) : isHydroponicsBayBuilt ? (
            <div className="flex flex-col items-center justify-center text-center p-6 rounded-lg bg-muted/50">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="mt-2 text-lg font-semibold">Hydroponics Bay built!</p>
                <p className="text-sm text-muted-foreground">Passively growing apples.</p>
            </div>
        ): null}
        
        <Separator />

        {/* Furnace Section */}
        {isWorkbenchBuilt && !isFurnaceBuilt && furnaceRecipe ? (
          <Card className="bg-muted/50 p-6 w-full text-center">
            <CardTitle className="flex items-center justify-center text-xl mb-4">
              <Power className="mr-2 h-6 w-6" /> Build a Furnace
            </CardTitle>
            <CardDescription className="mb-4">
              Smelts scrap metal and other materials into advanced components.
            </CardDescription>
            <div className="flex flex-col gap-2 text-sm my-4 items-start mx-auto max-w-xs">
                <span className="font-semibold text-muted-foreground self-center">Requires:</span>
                <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
                    {Object.entries(furnaceRecipe.requirements).map(([resource, amount]) => (
                    <span key={resource} className="flex items-center">
                        {resourceIcons[resource as Resource]}
                        {itemData[resource as Resource].name}: {amount}
                    </span>
                    ))}
                </div>
            </div>
            <Button 
                onClick={() => handleBuild('recipe_furnace')} 
                disabled={!canCraft('recipe_furnace') || gameState.playerStats.health <= 0 || isBusy}
                className="w-full sm:w-auto mt-4"
              >
                <Hammer className="mr-2 h-4 w-4" />
                Build
            </Button>
          </Card>
        ) : isFurnaceBuilt ? (
            <div className="flex flex-col items-center justify-center text-center p-6 rounded-lg bg-muted/50">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="mt-2 text-lg font-semibold">Furnace built!</p>
                <p className="text-sm text-muted-foreground">Automated smelting is available.</p>
            </div>
        ): null}

        <Separator />

        {/* Drone Bay Section */}
        {isWorkbenchBuilt && !isDroneBayBuilt && droneBayRecipe ? (
          <Card className="bg-muted/50 p-6 w-full text-center">
            <CardTitle className="flex items-center justify-center text-xl mb-4">
              <Bot className="mr-2 h-6 w-6" /> Build a Drone Bay
            </CardTitle>
            <CardDescription className="mb-4">
              Construct a bay to house and operate a scavenger drone for automated resource collection.
            </CardDescription>
            <div className="flex flex-col gap-2 text-sm my-4 items-start mx-auto max-w-xs">
                <span className="font-semibold text-muted-foreground self-center">Requires:</span>
                <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
                    {Object.entries(droneBayRecipe.requirements).map(([resource, amount]) => (
                    <span key={resource} className="flex items-center">
                        {resourceIcons[resource as Resource]}
                        {itemData[resource as Resource].name}: {amount}
                    </span>
                    ))}
                </div>
            </div>
            <Button 
                onClick={() => handleBuild('recipe_droneBay')} 
                disabled={!canCraft('recipe_droneBay') || gameState.playerStats.health <= 0 || isBusy}
                className="w-full sm:w-auto mt-4"
              >
                <Hammer className="mr-2 h-4 w-4" />
                Build
            </Button>
          </Card>
        ) : isDroneBayBuilt ? (
            <div className="flex flex-col items-center justify-center text-center p-6 rounded-lg bg-muted/50">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="mt-2 text-lg font-semibold">Drone Bay built!</p>
                <p className="text-sm text-muted-foreground">Scavenger drone is available for deployment.</p>
            </div>
        ): null}
      </CardContent>
    </Card>
  );
}
