
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
import FarmingPanel from './FarmingPanel';
import DailyRewardModal from './DailyRewardModal';
import FactoryPanel from './FactoryPanel';
import SkillsPanel from './SkillsPanel';
import FishingPanel from './FishingPanel';
import MiningPanel from './MiningPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, LogOut, Settings } from 'lucide-react';
import { ExploreIcon, QuestIcon, InventoryIcon, CraftIcon, CharacterIcon, BaseIcon, FurnaceIcon, MarketIcon, FarmingIcon, FishingIcon, FactoryIcon, SkillsIcon, TechIcon, MiningIcon } from '@/lib/icon-mapping';
import { GlowIcon } from '@/components/ui/glow-icon';
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
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase/provider';

export default function GameUI() {
  const { gameState, dispatch } = useGame();
  const { user, isLoading: isUserLoading } = useUser();
  const { auth } = useFirebase();
  const router = useRouter();
  const isMobile = useBreakpoint('sm');
  const [activeTab, setActiveTab] = useState('explore');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !gameState.isInitialized || !user) {
    return <LoadingScreen />;
  }

  if (gameState.characterName === 'Survivor') {
    return <WelcomeScreen />;
  }

  const handleLogout = async () => {
    await auth.signOut();
    dispatch({ type: 'RESET_GAME_NO_LOCALSTORAGE' });
    router.push('/login');
  };

  const isGameOver = gameState.playerStats.health <= 0;
  const isBusy = gameState.isResting || gameState.smeltingQueue > 0 || gameState.ironIngotSmeltingQueue > 0 || gameState.charcoalSmeltingQueue > 0;

  const showFurnace = gameState.builtStructures.includes('furnace');
  const showMarket = gameState.builtStructures.includes('workbench');
  const showFarming = gameState.builtStructures.includes('hydroponicsBay');
  const showMining = gameState.completedQuests.includes('quest_kael_mining');

  const hasReadyCrops = gameState.farmPlots?.some(plot => {
    if (!plot.seed || !plot.plantedTimestamp) return false;
    return now >= plot.plantedTimestamp + plot.duration;
  });

  const tabs = [
    { value: "explore", label: "Explore", icon: ExploreIcon },
    { value: "community", label: "Quests", icon: QuestIcon },
    { value: "inventory", label: "Inventory", icon: InventoryIcon },
    { value: "craft", label: "Craft", icon: CraftIcon },
    { value: "character", label: "Character", icon: CharacterIcon },
    { value: "base", label: "Base", icon: BaseIcon },
    { value: "furnace", label: "Furnace", icon: FurnaceIcon, condition: showFurnace },
    { value: "market", label: "Market", icon: MarketIcon, condition: showMarket },
    { value: "farming", label: "Farming", icon: FarmingIcon, condition: showFarming, badge: hasReadyCrops },
    { value: "fishing", label: "Fishing", icon: FishingIcon },
    { value: "mining", label: "Mining", icon: MiningIcon, condition: showMining },
    { value: "factory", label: "Factory", icon: FactoryIcon },
    { value: "skills", label: "Skills", icon: SkillsIcon },
    { value: "tech", label: "Tech", icon: TechIcon },
  ].filter(tab => tab.condition !== false);

  const handleTabChange = (value: string) => {
    console.log('handleTabChange:', value);
    setActiveTab(value);
  }

  console.log('GameUI Render: activeTab=', activeTab, 'isBusy=', isBusy, 'isResting=', gameState.isResting, 'isIdle=', gameState.isIdle);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col justify-between gap-4 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm text-card-foreground p-4 shadow-lg shadow-primary/5">
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
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Log Out</span>
            </Button>
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
            <TabsList className="h-auto flex-wrap justify-start gap-2 bg-muted/50 p-2 rounded-lg border border-white/5">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  disabled={isBusy}
                  className="flex items-center justify-center gap-2 text-xs h-9 sm:text-sm px-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/50 border border-transparent transition-all duration-300"
                >
                  <div className="relative flex items-center gap-2">
                    <GlowIcon icon={tab.icon} className="h-4 w-4" />
                    {tab.badge && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                    )}
                    <span className="leading-none font-medium tracking-wide">{tab.label}</span>
                  </div>
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
            {showFarming && <TabsContent value="farming" className="mt-4"><FarmingPanel /></TabsContent>}
            <TabsContent value="fishing" className="mt-4"><FishingPanel /></TabsContent>
            {showMining && <TabsContent value="mining" className="mt-4"><MiningPanel /></TabsContent>}
            <TabsContent value="factory" className="mt-4"><FactoryPanel /></TabsContent>
            <TabsContent value="skills" className="mt-4"><SkillsPanel /></TabsContent>
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
            <AlertDialogAction onClick={() => { dispatch({ type: 'RESET_GAME' }); }}>
              Start Anew
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DailyRewardModal />
    </div >
  );
}
