// src/lib/game-data/quests.ts
import type { Resource, Item } from '../game-types';

export type QuestRequirement = {
    type: 'item';
    item: Resource | Item;
    amount: number;
} | {
    type: 'structure';
    structure: Item;
    amount: number;
};

type QuestReward = {
    type: 'item';
    item: Resource | Item;
    amount: number;
} | {
    type: 'silver';
    amount: number;
};

export interface Quest {
    id: string;
    title: string;
    npc: string;
    description: string;
    requirements: QuestRequirement[];
    rewards: QuestReward[];
    completionMessage: string;
    unlocks?: string;
    dependsOn?: string;
}

export const quests: Quest[] = [
    {
        id: 'quest_silas_1',
        title: 'A Glimmer of Trust',
        npc: 'Silas, the Watcher',
        description: 'A grizzled man named Silas watches you from the shadows of a collapsed building. "Another scavenger," he mutters. "The wasteland chews up your kind. If you want to prove you\'re different, bring me some supplies. An apple and a bottle of water. Let\'s see if you can even manage that."',
        requirements: [
            { type: 'item', item: 'water', amount: 1 },
            { type: 'item', item: 'apple', amount: 1 }
        ],
        rewards: [
            { type: 'silver', amount: 10 }
        ],
        completionMessage: 'Silas takes the supplies and gives you a curt nod. "Hmph. You survived your first day. Don\'t get cocky. Maybe you have a sliver of sense after all."',
        unlocks: 'quest_silas_2',
    },
    {
        id: 'quest_silas_2',
        title: 'Building a Foundation',
        npc: 'Silas, the Watcher',
        description: '"So, you can scavenge. Big deal," Silas scoffs, though he seems a bit less hostile. "Survival isn\'t just about what you can find, it\'s about what you can make. That pile of junk you call a camp won\'t last a season. Build a proper workbench. Then we can talk."',
        requirements: [
            { type: 'structure', structure: 'workbench', amount: 1 }
        ],
        rewards: [
            { type: 'item', item: 'cookedApple', amount: 2 },
            { type: 'silver', amount: 25 },
        ],
        completionMessage: 'Silas inspects your new workbench. "Not bad. A bit crooked, but it\'ll hold. You\'re learning. Having a base of operations changes things. Here, take these. A hot meal does wonders for morale."',
        dependsOn: 'quest_silas_1',
        unlocks: 'quest_silas_3',
    },
    {
        id: 'quest_silas_3',
        title: 'The Spark of Progress',
        npc: 'Silas, the Watcher',
        description: 'Silas points to your primitive tools. "A workbench is a start, but you need better gear. The key is components. You can\'t make them with your bare hands. Build a Furnace, smelt down some scrap, and bring me proof you can create something more advanced. Bring me one of those electronic components."',
        requirements: [
            { type: 'item', item: 'components', amount: 1 }
        ],
        rewards: [
            { type: 'silver', amount: 50 },
            { type: 'item', item: 'scrap', amount: 10 }
        ],
        completionMessage: 'He takes the component, turning it over in his hand. "See? From useless junk to the heart of a machine. This is how we rebuild. You\'re starting to think long-term. Keep this up. Here\'s some more scrap, put it to good use."',
        dependsOn: 'quest_silas_2',
    }
];
