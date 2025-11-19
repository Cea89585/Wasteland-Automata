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
        description: 'A grizzled man named Silas watches you from the shadows of a collapsed building. "Another scavenger," he mutters. "The wasteland chews up your kind. If you want to prove you\'re different, {{characterName}}, bring me some supplies. An apple and a bottle of water. Let\'s see if you can even manage that."',
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
    },
    {
        id: 'quest_kael_1',
        title: 'The Engineer\'s Proposal',
        npc: 'Kael, the Engineer',
        description: 'A man with oil-stained hands and sharp, focused eyes approaches you, carrying a complex-looking device. "The name\'s Kael. You\'re {{characterName}}, right? I\'ve seen your work. I\'m building a long-range comms array, but I\'m short on materials. You look capable. Bring me some refined iron ingots and we\'ll talk business."',
        requirements: [
            { type: 'item', item: 'ironIngot', amount: 10 },
        ],
        rewards: [
            { type: 'silver', amount: 200 },
        ],
        completionMessage: 'Kael takes the ingots, weighing them in his hand. "Good quality. This will work for the primary supports. It seems your reputation is well-earned. I have another, more lucrative, proposal for you if you\'re interested."',
        dependsOn: 'quest_silas_3',
        unlocks: 'quest_kael_2'
    },
    {
        id: 'quest_kael_2',
        title: 'Array Reinforcement',
        npc: 'Kael, the Engineer',
        description: '"The frame is solid, but the delicate parts need shielding," Kael says, pointing at a schematic. "I need reinforced iron plates to protect the core systems from wasteland interference. This is the real challenge, {{characterName}}. It requires more material and more finesse. Can you handle it?"',
        requirements: [
            { type: 'item', item: 'ironPlates', amount: 10 },
            { type: 'item', item: 'components', amount: 20 },
        ],
        rewards: [
            { type: 'item', item: 'metalDetector', amount: 1 },
            { type: 'silver', amount: 500 },
        ],
        completionMessage: 'Kael expertly fits the plates onto his device. "Perfect. The signal will be clean. You\'ve done well. This old metal detector is surplus to my needs; it should serve you better. We\'re close to finishing this project."',
        dependsOn: 'quest_kael_1',
    },
    {
        id: 'quest_elara_1',
        title: 'A Hoarder\'s Offer',
        npc: 'Elara, the Hoarder',
        description: 'A woman named Elara peeks out from behind a mountain of salvaged goods. "You look like you could use a leg up," she says, her eyes gleaming. "I have more of these shiny bits than I know what to do with. You look hungry. And thirsty. Bring me some simple provisions, and I\'ll make it worth your while. A fair trade."',
        requirements: [
            { type: 'item', item: 'apple', amount: 5 },
            { type: 'item', item: 'water', amount: 5 },
            { type: 'item', item: 'stone', amount: 30 }
        ],
        rewards: [
            { type: 'item', item: 'components', amount: 5 }
        ],
        completionMessage: 'Elara snatches the resources and hands you a small, heavy pouch. "A pleasure doing business. These components are top-notch... probably. Now, if you\'ll excuse me, I have... inventory to sort."',
    },
    {
        id: 'quest_anya_1',
        title: 'Forest Specimen',
        npc: 'Anya, the Botanist',
        description: 'A woman with dirt-stained hands and analytical eyes approaches you. "I\'ve seen you exploring. I\'m Anya. The flora in that forest... it\'s changing. Fascinating! I need samples. Bring me some of those strangely glowing mutated twigs. I need to understand what\'s happening."',
        requirements: [
            { type: 'item', item: 'mutatedTwigs', amount: 10 },
        ],
        rewards: [
            { type: 'silver', amount: 150 },
        ],
        completionMessage: 'Anya takes the twigs, her eyes alight with scientific curiosity. "Incredible! The cellular structure is unlike anything I\'ve seen. This is a major breakthrough. Your efforts have been invaluable. Please, take this for your troubles."',
        dependsOn: 'quest_silas_3',
    },
    {
        id: 'quest_anya_map_1',
        title: 'Structural Analysis',
        npc: 'Anya, the Botanist',
        description: '"I\'m building a new analysis station, but my supplies are low. The raw materials in this area are poor. Could you spare some basic construction materials? I need a solid foundation for my work."',
        requirements: [
            { type: 'item', item: 'wood', amount: 150 },
            { type: 'item', item: 'stone', amount: 150 },
        ],
        rewards: [
            { type: 'silver', amount: 500 },
        ],
        completionMessage: '"Perfect! This is exactly what I needed to get started," she says, already arranging the materials. "This will provide a stable base for my sensitive equipment. Thank you."',
        dependsOn: 'quest_anya_1',
        unlocks: 'quest_anya_map_2',
    },
    {
        id: 'quest_anya_map_2',
        title: 'Advanced Samples',
        npc: 'Anya, the Botanist',
        description: '"My station is built, but now I need more complex samples and parts. The local fruit has... unique properties. And I need advanced materials to reinforce my scanner. Bring me what I need, and I may have something very valuable for you."',
        requirements: [
            { type: 'item', item: 'banana', amount: 10 },
            { type: 'item', item: 'peach', amount: 10 },
            { type: 'item', item: 'components', amount: 10 },
            { type: 'item', item: 'ironPlates', amount: 5 },
        ],
        rewards: [
            { type: 'item', item: 'components', amount: 5 },
            { type: 'item', item: 'cookedApple', amount: 10 },
        ],
        completionMessage: '"Excellent. These samples are perfect, and the iron plates will shield my gear from any... unexpected energy signatures. My research is leading me to believe there are other, stranger places out there. I\'m close to a breakthrough."',
        dependsOn: 'quest_anya_map_1',
        unlocks: 'quest_anya_map_3',
    },
    {
        id: 'quest_anya_map_3',
        title: 'The Cartographer\'s Fee',
        npc: 'Anya, the Botanist',
        description: '"I\'ve done it! I\'ve cross-referenced my data with old-world satellite trajectories and found something: a route to a new area. But my informant, the one who gave me the satellite data, requires payment. A \'cartographer\'s fee,\' he calls it. Bring me 2000 Silver, and the map is yours."',
        requirements: [
            { type: 'item', item: 'silver', amount: 2000 },
        ],
        rewards: [
            { type: 'item', item: 'crudeMap', amount: 1 },
        ],
        completionMessage: '"Here is the fee... and here is the map. A new path is open to you. Who knows what you\'ll find out there. Good luck, and thank you. You\'ve funded some very important research today."',
        dependsOn: 'quest_anya_map_2',
    }
];
