
// src/components/game/FurnacePanel.tsx
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Power, Loader2, Cpu, Layers, PackageCheck, Fuel } from 'lucide-react';
import { Progress } from '../ui/progress';
import { GameIcon } from '@/lib/icon-mapping';
import { itemData } from '@/lib/game-data/items';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '../ui/tooltip';

const SMELT_DURATION = 10; // seconds

export default function FurnacePanel() {
  const { gameState, dispatch } = useGame();
  const [componentProgress, setComponentProgress] = useState(0);
  const [ironProgress, setIronProgress] = useState(0);
  const [charcoalProgress, setCharcoalProgress] = useState(0);
  const [glassProgress, setGlassProgress] = useState(0);


  // Component requirements
  const componentSmeltRequirements = { scrap: 10, wood: 4 };
  const maxSmeltableComponents = useMemo(() => {
    const { scrap, wood } = gameState.inventory;
    return Math.floor(Math.min(scrap / componentSmeltRequirements.scrap, wood / componentSmeltRequirements.wood));
  }, [gameState.inventory]);

  // Iron Ingot requirements
  const ironSmeltRequirements = { scrap: 20, wood: 10 };
  const maxSmeltableIron = useMemo(() => {
    const { scrap, wood } = gameState.inventory;
    return Math.floor(Math.min(scrap / ironSmeltRequirements.scrap, wood / ironSmeltRequirements.wood));
  }, [gameState.inventory]);

  // Charcoal requirements
  const charcoalSmeltRequirements = { wood: 5 };
  const maxSmeltableCharcoal = useMemo(() => {
    return Math.floor(gameState.inventory.wood / charcoalSmeltRequirements.wood);
  }, [gameState.inventory.wood]);

  // Glass Tube requirements
  const glassSmeltRequirements = { sand: 5 };
  const maxSmeltableGlass = useMemo(() => {
    return Math.floor((gameState.inventory.sand || 0) / glassSmeltRequirements.sand);
  }, [gameState.inventory.sand]);


  const isBusy = gameState.isResting;

  // Update progress based on timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      if (gameState.smeltingQueue > 0 && gameState.smeltingTimestamps?.components) {
        const elapsed = now - gameState.smeltingTimestamps.components;
        setComponentProgress(Math.min(100, (elapsed / 10000) * 100));
      } else {
        setComponentProgress(0);
      }

      if (gameState.ironIngotSmeltingQueue > 0 && gameState.smeltingTimestamps?.iron) {
        const elapsed = now - gameState.smeltingTimestamps.iron;
        setIronProgress(Math.min(100, (elapsed / 20000) * 100));
      } else {
        setIronProgress(0);
      }

      if (gameState.charcoalSmeltingQueue > 0 && gameState.smeltingTimestamps?.charcoal) {
        const elapsed = now - gameState.smeltingTimestamps.charcoal;
        setCharcoalProgress(Math.min(100, (elapsed / 5000) * 100));
      } else {
        setCharcoalProgress(0);
      }

      if (gameState.glassSmeltingQueue > 0 && gameState.smeltingTimestamps?.glass) {
        const elapsed = now - gameState.smeltingTimestamps.glass;
        setGlassProgress(Math.min(100, (elapsed / 10000) * 100));
      } else {
        setGlassProgress(0);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameState.smeltingQueue, gameState.ironIngotSmeltingQueue, gameState.charcoalSmeltingQueue, gameState.glassSmeltingQueue, gameState.smeltingTimestamps]);

  // Handler for components
  const handleSmeltComponent = () => {
    if (maxSmeltableComponents > 0) {
      dispatch({ type: 'START_SMELTING' });
      setComponentProgress(0);
    }
  };

  const handleSmeltAll = (type: 'components' | 'iron' | 'charcoal' | 'glass') => {
    let amount = 0;
    if (type === 'components') amount = maxSmeltableComponents;
    else if (type === 'iron') amount = maxSmeltableIron;
    else if (type === 'charcoal') amount = maxSmeltableCharcoal;
    else if (type === 'glass') amount = maxSmeltableGlass;

    if (amount > 0) {
      dispatch({ type: 'START_SMELTING_ALL', payload: { type, amount } });
      if (type === 'components') setComponentProgress(0);
      else if (type === 'iron') setIronProgress(0);
      else if (type === 'charcoal') setCharcoalProgress(0);
      else if (type === 'glass') setGlassProgress(0);
    }
  };

  const handleSmeltIron = () => {
    if (maxSmeltableIron > 0) {
      dispatch({ type: 'START_SMELTING_IRON' });
      setIronProgress(0);
    }
  };

  const handleMakeCharcoal = () => {
    if (maxSmeltableCharcoal > 0) {
      dispatch({ type: 'START_SMELTING_CHARCOAL' });
      setCharcoalProgress(0);
    }
  };

  const handleSmeltGlass = () => {
    if (maxSmeltableGlass > 0) {
      dispatch({ type: 'START_SMELTING_GLASS' });
      setGlassProgress(0);
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Furnace</CardTitle>
        <CardDescription>Smelt raw materials into advanced components.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Components */}
        <Card className="bg-muted/50 p-4 w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-grow">
              <div className="flex items-center font-semibold text-base mb-2">
                <Cpu className="mr-2 h-5 w-5" /> Smelt Components
              </div>
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <span>Requires:</span>
                  <span className="flex items-center">
                    <GameIcon type="item" id="scrap" size={16} className="mr-1" />
                    {itemData['scrap'].name}: {componentSmeltRequirements.scrap}
                  </span>
                  <span className="flex items-center">
                    <GameIcon type="item" id="wood" size={16} className="mr-1" />
                    {itemData['wood'].name}: {componentSmeltRequirements.wood}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span>Creates:</span>
                  <span className="flex items-center font-medium text-primary">
                    <GameIcon type="item" id="components" size={16} className="mr-1" />
                    1x {itemData['components'].name}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 w-full sm:w-auto sm:min-w-[200px]">
              {gameState.smeltingQueue > 0 ? (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground text-center flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Smelting... ({gameState.smeltingQueue})
                  </p>
                  <Progress value={componentProgress} className="w-full" />
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <Button
                    onClick={handleSmeltComponent}
                    disabled={maxSmeltableComponents < 1 || isBusy || gameState.playerStats.health <= 0}
                    className="flex-1"
                    variant={maxSmeltableComponents > 0 ? 'default' : 'outline'}
                  >
                    <Power className="mr-2 h-4 w-4" />
                    Smelt
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-1">
                          <Button
                            onClick={() => handleSmeltAll('components')}
                            disabled={maxSmeltableComponents < 2 || isBusy || gameState.playerStats.health <= 0}
                            className="w-full"
                            variant="secondary"
                          >
                            <PackageCheck className="mr-2 h-4 w-4" />
                            All ({maxSmeltableComponents})
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {maxSmeltableComponents < 2 ? <p>Need resources for 2+ items</p> : <p>Smelt all possible</p>}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Iron Ingots */}
        <Card className="bg-muted/50 p-4 w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-grow">
              <div className="flex items-center font-semibold text-base mb-2">
                <Layers className="mr-2 h-5 w-5" /> Smelt Iron Ingots
              </div>
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <span>Requires:</span>
                  <span className="flex items-center">
                    <GameIcon type="item" id="scrap" size={16} className="mr-1" />
                    {itemData['scrap'].name}: {ironSmeltRequirements.scrap}
                  </span>
                  <span className="flex items-center">
                    <GameIcon type="item" id="wood" size={16} className="mr-1" />
                    {itemData['wood'].name}: {ironSmeltRequirements.wood}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span>Creates:</span>
                  <span className="flex items-center font-medium text-primary">
                    <GameIcon type="item" id="ironIngot" size={16} className="mr-1" />
                    1x {itemData['ironIngot'].name}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 w-full sm:w-auto sm:min-w-[200px]">
              {gameState.ironIngotSmeltingQueue > 0 ? (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground text-center flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Smelting... ({gameState.ironIngotSmeltingQueue})
                  </p>
                  <Progress value={ironProgress} className="w-full" />
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <Button
                    onClick={handleSmeltIron}
                    disabled={maxSmeltableIron < 1 || isBusy || gameState.playerStats.health <= 0}
                    className="flex-1"
                    variant={maxSmeltableIron > 0 ? 'default' : 'outline'}
                  >
                    <Power className="mr-2 h-4 w-4" />
                    Smelt
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-1">
                          <Button
                            onClick={() => handleSmeltAll('iron')}
                            disabled={maxSmeltableIron < 2 || isBusy || gameState.playerStats.health <= 0}
                            className="w-full"
                            variant="secondary"
                          >
                            <PackageCheck className="mr-2 h-4 w-4" />
                            All ({maxSmeltableIron})
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {maxSmeltableIron < 2 ? <p>Need resources for 2+ items</p> : <p>Smelt all possible</p>}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Charcoal */}
        <Card className="bg-muted/50 p-4 w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-grow">
              <div className="flex items-center font-semibold text-base mb-2">
                <Fuel className="mr-2 h-5 w-5" /> Make Charcoal
              </div>
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <span>Requires:</span>
                  <span className="flex items-center">
                    <GameIcon type="item" id="wood" size={16} className="mr-1" />
                    {itemData['wood'].name}: {charcoalSmeltRequirements.wood}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span>Creates:</span>
                  <span className="flex items-center font-medium text-primary">
                    <GameIcon type="item" id="charcoal" size={16} className="mr-1" />
                    1x {itemData['charcoal'].name}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 w-full sm:w-auto sm:min-w-[200px]">
              {gameState.charcoalSmeltingQueue > 0 ? (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground text-center flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Making... ({gameState.charcoalSmeltingQueue})
                  </p>
                  <Progress value={charcoalProgress} className="w-full" />
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <Button
                    onClick={handleMakeCharcoal}
                    disabled={maxSmeltableCharcoal < 1 || isBusy || gameState.playerStats.health <= 0}
                    className="flex-1"
                    variant={maxSmeltableCharcoal > 0 ? 'default' : 'outline'}
                  >
                    <Power className="mr-2 h-4 w-4" />
                    Make
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-1">
                          <Button
                            onClick={() => handleSmeltAll('charcoal')}
                            disabled={maxSmeltableCharcoal < 2 || isBusy || gameState.playerStats.health <= 0}
                            className="w-full"
                            variant="secondary"
                          >
                            <PackageCheck className="mr-2 h-4 w-4" />
                            All ({maxSmeltableCharcoal})
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {maxSmeltableCharcoal < 2 ? <p>Need resources for 2+ items</p> : <p>Make all possible</p>}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Glass Tubes */}
        {gameState.unlockedRecipes.includes('recipe_glassTube') && (
          <Card className="bg-muted/50 p-4 w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-grow">
                <div className="flex items-center font-semibold text-base mb-2">
                  <GameIcon type="item" id="glassTube" size={20} className="mr-2" /> Smelt Glass Tubes
                </div>
                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <span>Requires:</span>
                    <span className="flex items-center">
                      <GameIcon type="item" id="sand" size={16} className="mr-1" />
                      {itemData['sand'].name}: {glassSmeltRequirements.sand}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span>Creates:</span>
                    <span className="flex items-center font-medium text-primary">
                      <GameIcon type="item" id="glassTube" size={16} className="mr-1" />
                      1x {itemData['glassTube'].name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 w-full sm:w-auto sm:min-w-[200px]">
                {gameState.glassSmeltingQueue > 0 ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground text-center flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Smelting... ({gameState.glassSmeltingQueue})
                    </p>
                    <Progress value={glassProgress} className="w-full" />
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-stretch gap-2">
                    <Button
                      onClick={handleSmeltGlass}
                      disabled={maxSmeltableGlass < 1 || isBusy || gameState.playerStats.health <= 0}
                      className="flex-1"
                      variant={maxSmeltableGlass > 0 ? 'default' : 'outline'}
                    >
                      <Power className="mr-2 h-4 w-4" />
                      Smelt
                    </Button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex-1">
                            <Button
                              onClick={() => handleSmeltAll('glass')}
                              disabled={maxSmeltableGlass < 2 || isBusy || gameState.playerStats.health <= 0}
                              className="w-full"
                              variant="secondary"
                            >
                              <PackageCheck className="mr-2 h-4 w-4" />
                              All ({maxSmeltableGlass})
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {maxSmeltableGlass < 2 ? <p>Need resources for 2+ items</p> : <p>Smelt all possible</p>}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
