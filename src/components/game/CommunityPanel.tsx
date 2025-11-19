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

    const availableQuests = quests.filter(quest => {
        if (completedQuests.includes(quest.id)) {
            return false;
        }
        if (quest.dependsOn) {
            return completedQuests.includes(quest.dependsOn);
        }
        return true;
    });

    const handleSelectQuest = (questId: string) => {
        const quest = availableQuests.find(q => q.id === questId);
        setSelectedQuest(quest || null);
    };

    const handleBack = () => {
        setSelectedQuest(null);
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
                ) : selectedQuest ? (
                    <QuestDetails quest={selectedQuest} onBack={handleBack} />
                ) : (
                    <QuestList quests={availableQuests} onSelectQuest={handleSelectQuest} />
                )}
            </CardContent>
        </Card>
    );
}
