// src/components/game/QuestDetails.tsx
'use client';

import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';
import type { Quest } from '@/lib/game-data/quests';
import { itemData } from '@/lib/game-data/items';
import { allIcons } from './GameIcons';

interface QuestDetailsProps {
    quest: Quest;
    onBack: () => void;
}

export default function QuestDetails({ quest, onBack }: QuestDetailsProps) {
    const { gameState, dispatch } = useGame();
    const { inventory, completedQuests, playerStats, isResting, smeltingQueue, builtStructures } = gameState;
    const isBusy = isResting || smeltingQueue > 0;
    const isDead = playerStats.health <= 0;

    const canComplete = (questId: string) => {
        const quest = gameState.completedQuests.includes(questId) ? null : quest;
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
        onBack(); // Go back to the list after completing
    }

    return (
        <div className="space-y-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Quests
            </Button>
            <Card className="bg-muted/50">
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
        </div>
    );
}
