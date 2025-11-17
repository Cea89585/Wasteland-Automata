// src/components/game/GameUI.tsx
'use client';

import { useGame } from '@/hooks/use-game';
import LoadingScreen from './LoadingScreen';
import StatsPanel from './StatsPanel';
import LogPanel from './LogPanel';
import ExplorationPanel from './ExplorationPanel';
import InventoryPanel from './InventoryPanel';
import CraftingPanel from './CraftingPanel';
import BasePanel from './BasePanel';
import TechPanel from './TechPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Backpack, Compass, Hammer, Home, BookOpen } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function GameUI() {
  const { gameState } = useGame();

  if (!gameState.isInitialized) {
    return <LoadingScreen />;
  }

  const isGameOver = gameState.playerStats.health <= 0;
  const isBusy = gameState.isResting;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-lg border bg-card text-card-foreground p-4 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold font-headline text-primary">
          Wasteland Automata
        </h1>
        <StatsPanel />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <LogPanel />
        </div>
        <div className="lg:col-span-3">
          <Tabs defaultValue="explore" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="explore" disabled={isBusy}><Compass className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Explore</span></TabsTrigger>
              <TabsTrigger value="inventory" disabled={isBusy}><Backpack className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Inventory</span></TabsTrigger>
              <TabsTrigger value="craft" disabled={isBusy}><Hammer className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Craft</span></TabsTrigger>
              <TabsTrigger value="base" disabled={isBusy}><Home className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Base</span></TabsTrigger>
              <TabsTrigger value="tech" disabled={isBusy}><BookOpen className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Tech</span></TabsTrigger>
            </TabsList>
            <TabsContent value="explore" className="mt-4"><ExplorationPanel /></TabsContent>
            <TabsContent value="inventory" className="mt-4"><InventoryPanel /></TabsContent>
            <TabsContent value="craft" className="mt-4"><CraftingPanel /></TabsContent>
            <TabsContent value="base" className="mt-4"><BasePanel /></TabsContent>
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
