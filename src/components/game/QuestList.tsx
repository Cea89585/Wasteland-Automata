// src/components/game/QuestList.tsx
'use client';

import { Card } from '@/components/ui/card';
import type { Quest } from '@/lib/game-data/quests';
import { User, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';

interface QuestListProps {
    quests: Quest[];
    onSelectQuest: (questId: string) => void;
}

export default function QuestList({ quests, onSelectQuest }: QuestListProps) {

    // Group quests by NPC to only show one entry per character
    const uniqueNpcs = useMemo(() => {
        const npcMap = new Map<string, Quest>();
        quests.forEach(quest => {
            if (!npcMap.has(quest.npc)) {
                npcMap.set(quest.npc, quest);
            }
        });
        return Array.from(npcMap.values());
    }, [quests]);

    return (
        <div className="space-y-2">
            {uniqueNpcs.map(quest => (
                <Card 
                    key={quest.npc} 
                    className="bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => onSelectQuest(quest.id)}
                >
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <User className="h-8 w-8 text-primary" />
                            <div className="flex flex-col">
                                <span className="font-semibold">{quest.npc}</span>
                                <span className="text-sm text-muted-foreground">Has a request for you.</span>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                </Card>
            ))}
        </div>
    );
}
