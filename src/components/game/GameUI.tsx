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
import CharacterPanel from './CharacterPanel'; // New Import
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Backpack, Compass, Hammer, Home, BookOpen, User, RotateCcw } from 'lucide-react'; // New: User icon, RotateCcw
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
import { Button } from '../ui/button';

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
        <StatsPanel />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <LogPanel />
        </div>
        <div className="lg:col-span-3">
          <Tabs defaultValue="explore" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="explore" disabled={isBusy}><Compass className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Explore</span></TabsTrigger>
              <TabsTrigger value="inventory" disabled={isBusy}><Backpack className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Inventory</span></TabsTrigger>
              <TabsTrigger value="craft" disabled={isBusy}><Hammer className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Craft</span></TabsTrigger>
              <TabsTrigger value="character" disabled={isBusy}><User className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Character</span></TabsTrigger>
              <TabsTrigger value="base" disabled={isBusy}><Home className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Base</span></TabsTrigger>
              <TabsTrigger value="tech" disabled={isBusy}><BookOpen className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Tech</span></TabsTrigger>
            </TabsList>
            <TabsContent value="explore" className="mt-4"><ExplorationPanel /></TabsContent>
            <TabsContent value="inventory" className="mt-4"><InventoryPanel /></TabsContent>
            <TabsContent value="craft" className="mt-4"><CraftingPanel /></TabsContent>
            <TabsContent value="character" className="mt-4"><CharacterPanel /></TabsContent>
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
