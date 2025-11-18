// src/components/game/CommunityPanel.tsx
'use client';

import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Users, Check } from 'lucide-react';
import { quests } from '@/lib/game-data/quests';
import { itemData } from '@/lib/game-data/items';
import { allIcons } from './GameIcons';

export default function CommunityPanel() {
    const { gameState, dispatch } = useGame();
    const { inventory, completedQuests, playerStats, isResting, smeltingQueue, builtStructures } = gameState;
    const isBusy = isResting || smeltingQueue > 0;
    const isDead = playerStats.health <= 0;

    const availableQuests = quests.filter(quest => {
        // Not already completed
        if (completedQuests.includes(quest.id)) {
            return false;
        }
        // If it has a dependency, check if it's completed
        if (quest.dependsOn) {
            return completedQuests.includes(quest.dependsOn);
        }
        // If no dependency, it's available from the start
        return true;
    });

    const canComplete = (questId: string) => {
        const quest = quests.find(q => q.id === questId);
        if (!quest) return false;

        for (const req of quest.requirements) {
            if (req.type === 'item') {
                if ((inventory[req.item] || 0) < req.amount) {
                    return false;
                }
            } else if (req.type === 'structure') {
                if (!builtStructures.includes(req.structure)) {
                    return false;
                }
            }
        }
        return true;
    };

    const handleCompleteQuest = (questId: string) => {
        dispatch({ type: 'COMPLETE_QUEST', payload: { questId } });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users /> Quests</CardTitle>
                <CardDescription>Locals in the wasteland may have tasks for you.</CardDescription>
            </CardHeader>
            <CardContent>
                {availableQuests.length === 0 ? (
                    <div className="text-center text-muted-foreground p-8">
                        <p>You've helped everyone you can for now.</p>
                        <p className="text-xs">More opportunities may arise as you explore and build.</p>
                    </div>
                ) : (
                    <ScrollArea className="h-[300px]">
                        <div className="space-y-4 pr-4">
                            {availableQuests.map(quest => (
                                <Card key={quest.id} className="bg-muted/50">
                                    <CardHeader>
                                        <CardTitle className="text-xl">{quest.title}</CardTitle>

                                        <CardDescription>From: {quest.npc}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-sm text-muted-foreground italic">"{quest.description}"</p>
                                        
                                        <div className="space-y-2">
                                            <h4 className="font-semibold">Requirements:</h4>
                                            <div className="flex flex-col gap-1 text-sm">
                                                {quest.requirements.map((req, index) => (
                                                    <div key={index} className="flex items-center justify-between p-2 rounded bg-background/50">
                                                        <span className="flex items-center">
                                                            {allIcons[req.type === 'item' ? req.item : req.structure]} {itemData[req.type === 'item' ? req.item : req.structure].name}
                                                        </span>
                                                        {req.type === 'item' ? (
                                                            <span className={(inventory[req.item] || 0) >= req.amount ? 'text-green-400' : 'text-destructive'}>
                                                                {inventory[req.item] || 0} / {req.amount}
                                                            </span>
                                                        ) : (
                                                             <span className={builtStructures.includes(req.structure) ? 'text-green-400' : 'text-destructive'}>
                                                                {builtStructures.includes(req.structure) ? 'Built' : 'Not Built'}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-semibold">Rewards:</h4>
                                            <div className="flex flex-wrap gap-2 text-sm">
                                                {quest.rewards.map((reward, index) => (
                                                    <div key={index} className="flex items-center gap-2 p-2 rounded bg-background/50">
                                                        {reward.type === 'item' ? allIcons[reward.item] : allIcons.silver}
                                                        <span>
                                                            {reward.amount}x {reward.type === 'item' ? itemData[reward.item].name : 'Silver'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Button 
                                            className="w-full"
                                            disabled={!canComplete(quest.id) || isBusy || isDead}
                                            onClick={() => handleCompleteQuest(quest.id)}
                                            variant={canComplete(quest.id) ? 'default' : 'outline'}
                                        >
                                            <Check className="mr-2 h-4 w-4" />
                                            Complete Request
                                        </Button>

                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}
