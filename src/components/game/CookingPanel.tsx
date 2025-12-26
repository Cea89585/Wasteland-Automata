// src/components/game/CookingPanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { recipes as allRecipes } from '@/lib/game-data/recipes';
import { GameIcon } from '@/lib/icon-mapping';
import { itemData } from '@/lib/game-data/items';
import { Utensils, PackageCheck, Flame } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export default function CookingPanel() {
    const { gameState, dispatch } = useGame();
    const { inventory, unlockedRecipes } = gameState;

    // Filter for cooking recipes that are unlocked
    const cookingRecipes = allRecipes.filter(r =>
        r.unlockedBy.includes('kitchen') &&
        unlockedRecipes.includes(r.id)
    );

    const calculateMaxCraftable = (recipeId: string) => {
        const recipe = allRecipes.find(r => r.id === recipeId);
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
                <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-6 w-6" />
                    Kitchen
                </CardTitle>
                <CardDescription>Prepare hearty meals to restore your vitals.</CardDescription>
            </CardHeader>
            <CardContent>
                {cookingRecipes.length === 0 ? (
                    <p className="text-muted-foreground italic">Build a kitchen and explore to find recipes.</p>
                ) : (
                    <div className="space-y-3">
                        {cookingRecipes.map(recipe => {
                            const maxCraftable = calculateMaxCraftable(recipe.id);
                            const isCraftable = maxCraftable > 0;

                            return (
                                <Card key={recipe.id} className="bg-muted/30 border-dashed">
                                    <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex-grow w-full">
                                            <div className="flex items-center font-semibold text-base mb-1 gap-2">
                                                <GameIcon type="item" id={recipe.creates} size={20} /> {recipe.name}
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-2">{recipe.description}</p>
                                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                                                {Object.entries(recipe.requirements).map(([resource, amount]) => {
                                                    const has = inventory[resource as keyof typeof inventory] || 0;
                                                    const enough = has >= amount;
                                                    return (
                                                        <span key={resource} className={enough ? 'text-green-600' : 'text-red-500 font-medium'}>
                                                            <GameIcon type="item" id={resource} size={14} className="inline mr-1" />
                                                            {itemData[resource as keyof typeof itemData]?.name || resource}: {has}/{amount}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant={isCraftable ? 'default' : 'outline'}
                                                onClick={() => dispatch({ type: 'CRAFT', payload: { recipeId: recipe.id } })}
                                                disabled={!isCraftable || gameState.playerStats.health <= 0 || isBusy}
                                                className="w-24"
                                            >
                                                <Flame className="mr-2 h-4 w-4" />
                                                Cook
                                            </Button>

                                            {maxCraftable > 1 && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="secondary"
                                                                size="icon"
                                                                onClick={() => dispatch({ type: 'CRAFT_ALL', payload: { recipeId: recipe.id, amount: maxCraftable } })}
                                                                disabled={gameState.playerStats.health <= 0 || isBusy}
                                                            >
                                                                <PackageCheck className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Cook Max ({maxCraftable})</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
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
