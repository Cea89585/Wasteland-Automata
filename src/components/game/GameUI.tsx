// src/components/game/GameUI.tsx
'use client';

import { useGame } from '@/hooks/use-game';
import { useBreakpoint } from '@/hooks/use-breakpoint';
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
import MarketPanel from './MarketPanel';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from 'react';

export default function GameUI() {
  const { gameState, dispatch } = useGame();
  const isMobile = useBreakpoint('sm');
  const [activeTab, setActiveTab] = useState('explore');

  if (!gameState.isInitialized) {
    return <LoadingScreen />;
  }

  const isGameOver = gameState.playerStats.health <= 0;
  const isBusy = gameState.isResting || gameState.isSmelting;

  const showFurnace = gameState.builtStructures.includes('furnace');
  const showMarket = gameState.builtStructures.includes('workbench');

  const tabs = [
    { value: "explore", label: "Explore", icon: <Compass className="h-4 w-4" /> },
    { value: "inventory", label: "Inventory", icon: <Backpack className="h-4 w-4" /> },
    { value: "craft", label: "Craft", icon: <Hammer className="h-4 w-4" /> },
    { value: "character", label: "Character", icon: <User className="h-4 w-4" /> },
    { value: "base", label: "Base", icon: <Home className="h-4 w-4" /> },
    { value: "furnace", label: "Furnace", icon: <Power className="h-4 w-4" />, condition: showFurnace },
    { value: "market", label: "Market", icon: <Coins className="h-4 w-4" />, condition: showMarket },
    { value: "tech", label: "Tech", icon: <BookOpen className="h-4 w-4" /> },
  ].filter(tab => tab.condition !== false);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
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
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
             {isMobile ? (
              <Select value={activeTab} onValueChange={handleTabChange} disabled={isBusy}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a tab" />
                </SelectTrigger>
                <SelectContent>
                  {tabs.map((tab) => (
                    <SelectItem key={tab.value} value={tab.value}>
                       <div className="flex items-center gap-2">
                         {tab.icon} {tab.label}
                       </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} disabled={isBusy} className="sm:flex sm:items-center sm:gap-2">
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            )}

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
