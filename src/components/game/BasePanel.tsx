// src/components/game/BasePanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Hammer, CheckCircle, Droplets, Power, Bot, Sprout, Fuel, Leaf } from 'lucide-react';
import { Button } from '../ui/button';
import { recipes } from '@/lib/game-data/recipes';
import type { Resource } from '@/lib/game-types';
import { resourceIcons } from './GameIcons';
import { itemData } from '@/lib/game-data/items';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Trees } from 'lucide-react';


const FuelSection = () => {
    const { gameState, dispatch } = useGame();
    const { inventory, power } = gameState;

    const canAddWood = inventory.wood > 0;
    const canAddBiomass = inventory.biomass > 0;
    
    const handleAddFuel = (fuelType: 'wood' | 'biomass') => {
        dispatch({ type: 'ADD_FUEL', payload: { fuelType } });
    }

    const maxPower = 1000;
    const powerPercentage = (power / maxPower) * 100;

    return (
        <Card className="bg-muted/50">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg gap-2"><Fuel /> Generator Fuel</CardTitle>
                <CardDescription>Add fuel to the generator to power your automated systems. Biomass is a much more efficient fuel source.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                         <span className="text-sm text-muted-foreground">Power Level</span>
                         <span className="font-mono text-primary">{power} / {maxPower}</span>
                    </div>
                    <Progress value={powerPercentage} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" onClick={() => handleAddFuel('wood')} disabled={!canAddWood}>
                                    <Trees className="mr-2"/> Add Wood
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Adds 10 Power</p>
                            </TooltipContent>
                        </Tooltip>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" onClick={() => handleAddFuel('biomass')} disabled={!canAddBiomass}>
                                    <Leaf className="mr-2"/> Add Biomass
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Adds 250 Power</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardContent>
        </Card>
    )
}

const StructureSection = ({
  structureId,
  recipeId,
  title,
  description,
  Icon,
  successText,
  successDescription,
}: {
  structureId: string;
  recipeId: string;
  title: string;
  description: string;
  Icon: React.ElementType;
  successText: string;
  successDescription: string;
}) => {
  const { gameState, dispatch } = useGame();
  const recipe = recipes.find(r => r.id === recipeId);
  const isBuilt = gameState.builtStructures.includes(structureId);
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

  if (isBuilt) {
    return (
      <div className="flex items-center gap-4 text-center p-4 rounded-lg bg-muted/50">
        <CheckCircle className="h-10 w-10 text-green-500 flex-shrink-0" />
        <div className="text-left">
          <p className="text-base font-semibold">{successText}</p>
          <p className="text-xs text-muted-foreground">{successDescription}</p>
        </div>
      </div>
    );
  }

  if (recipe) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="flex-grow">
            <div className="flex items-center font-semibold text-base mb-2">
              <Icon className="mr-2 h-5 w-5" /> {title}
            </div>
             <p className="text-xs text-muted-foreground mb-3">{description}</p>
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
            variant={canCraft(recipeId) ? 'default' : 'outline'}
            onClick={() => handleBuild(recipeId)} 
            disabled={!canCraft(recipeId) || gameState.playerStats.health <= 0 || isBusy}
            aria-label={`Build ${title}`}
          >
            <Hammer className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}

export default function BasePanel() {
  const { gameState } = useGame();

  const isWorkbenchBuilt = gameState.builtStructures.includes('workbench');
  const isGeneratorBuilt = gameState.builtStructures.includes('generator');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Base</CardTitle>
        <CardDescription>A small patch of wasteland to call your own.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        
        <StructureSection 
          structureId="workbench"
          recipeId="recipe_workbench"
          title="Build a Workbench"
          description="A workbench is essential for unlocking more advanced crafting recipes."
          Icon={Home}
          successText="Workbench built!"
          successDescription="Advanced crafting is available."
        />

        {isWorkbenchBuilt && (
          <>
             <Separator />
            <StructureSection
              structureId="waterPurifier"
              recipeId="recipe_waterPurifier"
              title="Build a Water Purifier"
              description="Passively generates a steady supply of clean drinking water."
              Icon={Droplets}
              successText="Water Purifier built!"
              successDescription="Passively generating water."
            />
            <StructureSection
              structureId="hydroponicsBay"
              recipeId="recipe_hydroponicsBay"
              title="Build a Hydroponics Bay"
              description="Passively grows a slow but steady supply of edible plants."
              Icon={Sprout}
              successText="Hydroponics Bay built!"
              successDescription="Passively growing apples."
            />
            <Separator />
            <StructureSection
              structureId="furnace"
              recipeId="recipe_furnace"
              title="Build a Furnace"
              description="Smelts scrap metal and other materials into advanced components."
              Icon={Power}
              successText="Furnace built!"
              successDescription="Automated smelting is available."
            />
             <Separator />
             <StructureSection
                structureId="generator"
                recipeId="recipe_generator"
                title="Build a Power Generator"
                description="Consumes fuel to power your automated base systems, like the Drone Bay."
                Icon={Power}
                successText="Power Generator built!"
                successDescription="You can now fuel your base."
            />
            {isGeneratorBuilt && <FuelSection />}
             <Separator />
            <StructureSection
              structureId="droneBay"
              recipeId="recipe_droneBay"
              title="Build a Drone Bay"
              description="Construct a bay to house and operate a scavenger drone for automated resource collection."
              Icon={Bot}
              successText="Drone Bay built!"
              successDescription="Scavenger drone is available for deployment."
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
