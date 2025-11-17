// src/components/game/SettingsPage.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, ArrowLeft, BarChart, Package, Compass, Search } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { ScrollArea } from '../ui/scroll-area';
import { itemData } from '@/lib/game-data/items';
import { allIcons } from './GameIcons';

export default function SettingsPage() {
    const { gameState } = useGame();

    if (!gameState.isInitialized) {
        return null;
    }
    
    const { statistics } = gameState;

    const totalItemsGained = Object.entries(statistics.totalItemsGained)
        .filter(([, quantity]) => quantity > 0)
        .sort((a, b) => a[0].localeCompare(b[0]));


    return (
        <div className="flex flex-col gap-4">
             <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-lg border bg-card text-card-foreground p-4 shadow-sm">
                <div className="flex flex-col gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold font-headline text-primary">
                        Settings & Statistics
                    </h1>
                     <Link href="/">
                        <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 w-fit">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Game
                        </div>
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <BarChart /> General Statistics
                        </CardTitle>
                        <CardDescription>An overview of your journey so far.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                            <div className="flex items-center gap-2 font-medium">
                                <Compass /> Times Explored
                            </div>
                            <span className="font-mono text-lg font-semibold text-primary">{statistics.timesExplored}</span>
                        </div>
                         <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                            <div className="flex items-center gap-2 font-medium">
                                <Search /> Times Scavenged
                            </div>
                            <span className="font-mono text-lg font-semibold text-primary">{statistics.timesScavenged}</span>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package /> Item Collection
                        </CardTitle>
                        <CardDescription>All items you have gathered throughout your journey.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {totalItemsGained.length === 0 ? (
                            <p className="text-muted-foreground text-center h-[200px] flex items-center justify-center">No items gathered yet.</p>
                        ) : (
                        <ScrollArea className="h-[200px] pr-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {totalItemsGained.map(([itemId, quantity]) => {
                                const data = itemData[itemId as keyof typeof itemData];
                                return (
                                    <div key={itemId} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                        <div className="flex items-center gap-2">
                                            {allIcons[itemId]}
                                            <span className="font-medium text-sm">{data?.name}</span>
                                        </div>
                                        <span className="font-mono font-semibold text-primary">{quantity}</span>
                                    </div>
                                );
                                })}
                            </div>
                        </ScrollArea>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle>Danger Zone</CardTitle>
                    <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
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
                            <AlertDialogAction onClick={() => { localStorage.clear(); window.location.href = '/'; }}>
                                Yes, delete my save
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>

        </div>
    );
}
