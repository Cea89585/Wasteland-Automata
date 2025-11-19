
// src/components/game/GameUI.tsx
'use client';

import Link from 'next/link';
import { useGame } from '@/hooks/use-game';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import LoadingScreen from './LoadingScreen';
import WelcomeScreen from './WelcomeScreen';
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
import IdleTimer from './IdleTimer';
import CommunityPanel from './CommunityPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Backpack, Compass, Hammer, Home, BookOpen, User, Power, AlertTriangle, Coins, Settings, Users } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from 'react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

export default function GameUI() {
  const { gameState } = useGame();
  const isMobile = useBreakpoint('sm');
  const [activeTab, setActiveTab] = useState('explore');

  if (!gameState.isInitialized) {
    return <LoadingScreen />;
  }

  if (gameState.characterName === 'Survivor') {
    return <WelcomeScreen />;
  }

  const isGameOver = gameState.playerStats.health <= 0;
  const isBusy = gameState.isResting || gameState.smeltingQueue > 0 || gameState.ironIngotSmeltingQueue > 0 || gameState.charcoalSmeltingQueue > 0;

  const showFurnace = gameState.builtStructures.includes('furnace');
  const showMarket = gameState.builtStructures.includes('workbench');

  const tabs = [
    { value: "explore", label: "Explore", icon: <Compass className="h-4 w-4" /> },
    { value: "community", label: "Quests", icon: <Users className="h-4 w-4" /> },
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
      <header className="flex flex-col justify-between gap-4 rounded-lg border bg-card text-card-foreground p-4 shadow-sm">
        <div className="flex flex-row justify-between items-center w-full gap-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-headline text-primary">
                Wasteland Automata
                </h1>
                <IdleTimer />
            </div>
            <div className="flex items-center gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <span className="sr-only">Warning</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive" /> Important Warning</AlertDialogTitle>
                        <AlertDialogDescription>
                            If your health reaches 0%, you will die and your progress for this run will be permanently reset.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogAction>Acknowledge</AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Link href="/settings">
                    <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                        <span className="sr-only">Settings</span>
                    </Button>
                </Link>
            </div>
        </div>
        <div className="flex flex-col gap-2 w-full">
            <StatsPanel />
            <div className={cn("block sm:hidden")}>
                <SilverCounter />
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className={cn("lg:col-span-3 lg:order-1", isMobile ? "order-1" : "order-2")}>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
             <TabsList className="h-auto flex-wrap justify-start">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} disabled={isBusy} className="flex items-center gap-2 text-xs h-9 sm:text-sm">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

            <TabsContent value="explore" className="mt-4"><ExplorationPanel /></TabsContent>
            <TabsContent value="community" className="mt-4"><CommunityPanel /></TabsContent>
            <TabsContent value="inventory" className="mt-4"><InventoryPanel /></TabsContent>
            <TabsContent value="craft" className="mt-4"><CraftingPanel /></TabsContent>
            <TabsContent value="character" className="mt-4"><CharacterPanel /></TabsContent>
            <TabsContent value="base" className="mt-4"><BasePanel /></TabsContent>
            {showFurnace && <TabsContent value="furnace" className="mt-4"><FurnacePanel /></TabsContent>}
            {showMarket && <TabsContent value="market" className="mt-4"><MarketPanel /></TabsContent>}
            <TabsContent value="tech" className="mt-4"><TechPanel /></TabsContent>
          </Tabs>
        </div>
        <div className={cn("lg:col-span-2 flex flex-col gap-4", isMobile ? "order-2" : "order-1")}>
          <div className={cn("hidden sm:block")}>
            <SilverCounter />
          </div>
          <LogPanel />
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
