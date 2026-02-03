// src/components/game/CommunityPanel.tsx
'use client';
import { useState } from 'react';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { quests } from '@/lib/game-data/quests';
import QuestList from './QuestList';
import QuestDetails from './QuestDetails';
import type { Quest } from '@/lib/game-data/quests';

export default function CommunityPanel() {
    const { gameState } = useGame();
    const { completedQuests } = gameState;
    const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
    const [viewMode, setViewMode] = useState<'active' | 'completed'>('active');

    const activeQuests = quests.filter(quest => {
        if (completedQuests.includes(quest.id)) return false;
        if (quest.dependsOn) return completedQuests.includes(quest.dependsOn);
        return true;
    });

    const finishedQuests = quests.filter(quest => completedQuests.includes(quest.id));

    const displayedQuests = viewMode === 'active' ? activeQuests : finishedQuests;

    const handleSelectQuest = (questId: string) => {
        // Search in both lists to be safe, though displayedQuests contains the target
        const quest = quests.find(q => q.id === questId);
        setSelectedQuest(quest || null);
    };

    const handleBack = () => {
        setSelectedQuest(null);
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Users /> Quests</CardTitle>
                        <CardDescription>
                            {viewMode === 'active'
                                ? "Locals in the wasteland may have tasks for you."
                                : "Tales of your past accomplishments."}
                        </CardDescription>
                    </div>
                </div>
                {!selectedQuest && (
                    <div className="flex gap-2 mt-2">
                        <div className="flex p-1 bg-muted rounded-lg">
                            <button
                                onClick={() => setViewMode('active')}
                                className={`px-3 py-1 text-sm rounded-md transition-all ${viewMode === 'active' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setViewMode('completed')}
                                className={`px-3 py-1 text-sm rounded-md transition-all ${viewMode === 'completed' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Completed
                            </button>
                        </div>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {displayedQuests.length === 0 ? (
                    <div className="text-center text-muted-foreground p-8">
                        {viewMode === 'active' ? (
                            <>
                                <p>You've helped everyone you can for now.</p>
                                <p className="text-xs">More opportunities may arise as you explore and build.</p>
                            </>
                        ) : (
                            <p>No completed quests yet.</p>
                        )}
                    </div>
                ) : selectedQuest ? (
                    <QuestDetails quest={selectedQuest} onBack={handleBack} />
                ) : (
                    <QuestList quests={displayedQuests} onSelectQuest={handleSelectQuest} />
                )}
            </CardContent>
        </Card>
    );
}
