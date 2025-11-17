// src/components/game/GameUI.tsx
'use client';

import { useGame } from '@/hooks/use-game';
import LoadingScreen from './LoadingScreen';
import StatsPanel from './StatsPanel';
import LogPanel from './LogPanel';
import SilverCounter from './SilverCounter';
import ExplorationPanel from './ExplorationPanel';
import InventoryPanel from './InventoryPanel';
import CraftingPanel from './CraftingPanel';
import BasePanel from './BasePanel';
import TechPanel from './TechPanel';
import CharacterPanel from './CharacterPanel';
import FurnacePanel from './FurnacePanel';
import MarketPanel from './MarketPanel'; // New Import
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Backpack, Compass, Hammer, Home, BookOpen, User, RotateCcw, Power, AlertTriangle, Coins } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

export default function GameUI() {
  const { gameState } = useGame();

  if (!gameState.isInitialized) {
    return <LoadingScreen />;
  }

  const isGameOver = gameState.playerStats.health <= 0;
  const isBusy = gameState.isResting || gameState.isSmelting;

  const showFurnace = gameState.builtStructures.includes('furnace');
  const showMarket = gameState.builtStructures.includes('workbench'); // Show market after workbench is built

  const tabGridCols = () => {
    let count = 6;
    if (showFurnace) count++;
    if (showMarket) count++;
    return `grid-cols-${count}`;
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-lg border bg-card text-card-foreground p-4 shadow-sm">
        <div className="flex flex-col gap-2">
            <h1 className="text-xl sm:text-2xl font-bold font-headline text-primary">
            Wasteland Automata
            </h1>
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="w-fit">
                    <RotateCcw className="mr-2 h-4 w-4" /> Reset Game
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your game progress. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { localStorage.clear(); window.location.reload(); }}>
                    Yes, delete my save
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
        <div className="flex flex-col gap-4 w-full sm:w-auto">
            <Alert variant="destructive" className="border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    If your health reaches 0%, you will die and your progress will be reset.
                </AlertDescription>
            </Alert>
            <StatsPanel />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <LogPanel />
          <SilverCounter />
        </div>
        <div className="lg:col-span-3">
          <Tabs defaultValue="explore" className="w-full">
            <TabsList className={cn("grid w-full", `grid-cols-${6 + (showFurnace ? 1 : 0) + (showMarket ? 1 : 0)}`)}>
              <TabsTrigger value="explore" disabled={isBusy}><Compass className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Explore</span></TabsTrigger>
              <TabsTrigger value="inventory" disabled={isBusy}><Backpack className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Inventory</span></TabsTrigger>
              <TabsTrigger value="craft" disabled={isBusy}><Hammer className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Craft</span></TabsTrigger>
              <TabsTrigger value="character" disabled={isBusy}><User className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Character</span></TabsTrigger>
              <TabsTrigger value="base" disabled={isBusy}><Home className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Base</span></TabsTrigger>
              {showFurnace && <TabsTrigger value="furnace" disabled={isBusy}><Power className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Furnace</span></TabsTrigger>}
              {showMarket && <TabsTrigger value="market" disabled={isBusy}><Coins className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Market</span></TabsTrigger>}
              <TabsTrigger value="tech" disabled={isBusy}><BookOpen className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Tech</span></TabsTrigger>
            </TabsList>
            <TabsContent value="explore" className="mt-4"><ExplorationPanel /></TabsContent>
            <TabsContent value="inventory" className="mt-4"><InventoryPanel /></TabsContent>
            <TabsContent value="craft" className="mt-4"><CraftingPanel /></TabsContent>
            <TabsContent value="character" className="mt-4"><CharacterPanel /></TabsContent>
            <TabsContent value="base" className="mt-4"><BasePanel /></TabsContent>
            {showFurnace && <TabsContent value="furnace" className="mt-4"><FurnacePanel /></TabsContent>}
            {showMarket && <TabsContent value="market" className="mt-4"><MarketPanel /></TabsContent>}
            <TabsContent value="tech" className="mt-4"><TechPanel /></TabsContent>
          </Tabs>
        </div>
      </div>
      <AlertDialog open={isGameOver}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>The End</AlertDialogTitle>
            <AlertDialogDescription>
              Your journey has ended. The wasteland is unforgiving. You can start a new journey by clearing your save data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => { localStorage.clear(); window.location.reload(); }}>
              Start Anew
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
