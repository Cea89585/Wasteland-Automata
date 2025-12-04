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
        unlocks: 'quest_kael_mining'
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
        dependsOn: 'quest_kael_mining',
        unlocks: 'quest_marcus_1' // Marcus arc starts after proving yourself with advanced tech
    },
    {
        id: 'quest_kael_mining',
        title: 'The Old Mines',
        npc: 'Kael, the Engineer',
        description: '"I\'ve located an old mining site. It\'s rich in resources, but you\'ll need the right tool to work it. Craft a pickaxe, and I\'ll show you where it is. We can get good iron and scrap from there."',
        requirements: [
            { type: 'item', item: 'pickaxe', amount: 1 }
        ],
        rewards: [
            { type: 'silver', amount: 100 }
        ],
        completionMessage: '"Good tool. Solid. The mine entrance is to the north. Be careful, the supports are old. But the haul will be worth it."',
        dependsOn: 'quest_kael_1',
        unlocks: 'quest_kael_2'
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
        completionMessage: 'Anya takes the twigs, her eyes alight with scientific curiosity. "Incredible! The cellular structure is unlike anything I\'ve seen. This is a major breakthrough. Your efforts have been invaluable. Please, take this for your troubles. Oh, and I\'ve marked the location of the mutated forest on your map - you should explore it further!"',
        dependsOn: 'quest_silas_3',
        unlocks: 'forest',
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
    },

    // Marcus Arc: The Salvage Wars
    {
        id: 'quest_marcus_1',
        title: 'An Offer You Can\'t Refuse',
        npc: 'Marcus, the Salvage King',
        description: 'A well-dressed man with a calculating smile approaches. "You\'re making waves, friend. I\'m Marcus. I run the largest salvage operation in three sectors. You\'ve got talent—wasted on small-time scavenging. Work for me. Bring me uranium—rare, valuable, dangerous. Prove you can handle the big leagues."',
        requirements: [
            { type: 'item', item: 'uranium', amount: 5 }
        ],
        rewards: [
            { type: 'silver', amount: 300 },
            { type: 'item', item: 'components', amount: 5 }
        ],
        completionMessage: 'Marcus weighs the uranium carefully. "Impressive. Most people wouldn\'t survive the radiation zones. You\'re either brave or stupid. Either way, you\'re useful. We\'ll talk again."',
        dependsOn: 'quest_kael_1',
        unlocks: 'quest_marcus_2',
    },
    {
        id: 'quest_marcus_2',
        title: 'The Price of Progress',
        npc: 'Marcus, the Salvage King',
        description: '"I need workers for my operation. Strong backs, sharp minds. But they need equipment. Bring me tools and materials—stone axes for cutting, iron plates for protection. Help me build my empire, and you\'ll have a place in it."',
        requirements: [
            { type: 'item', item: 'stoneAxe', amount: 5 },
            { type: 'item', item: 'ironPlates', amount: 20 }
        ],
        rewards: [
            { type: 'silver', amount: 800 },
            { type: 'item', item: 'biomass', amount: 10 }
        ],
        completionMessage: '"Perfect. My operation expands. Remember, {{characterName}}—in the wasteland, you\'re either building an empire or serving one. Choose wisely."',
        dependsOn: 'quest_marcus_1',
        unlocks: 'quest_marcus_3',
    },
    {
        id: 'quest_marcus_3',
        title: 'Consolidation of Power',
        npc: 'Marcus, the Salvage King',
        description: 'Marcus\'s expression is serious. "I\'m consolidating my holdings. I need advanced materials—charcoal for fuel, biomass for energy, components for automation. This is your chance to be part of something bigger than survival. Bring me what I need."',
        requirements: [
            { type: 'item', item: 'charcoal', amount: 30 },
            { type: 'item', item: 'biomass', amount: 30 },
            { type: 'item', item: 'components', amount: 15 }
        ],
        rewards: [
            { type: 'silver', amount: 1200 },
            { type: 'item', item: 'ironIngot', amount: 20 }
        ],
        completionMessage: '"Excellent work. You\'ve proven yourself valuable. But remember—loyalty is rewarded, betrayal is... not forgotten. We understand each other, yes?"',
        dependsOn: 'quest_marcus_2',
    },

    // Vera Arc: Echoes of the Past
    {
        id: 'quest_vera_1',
        title: 'The Archivist\'s Request',
        npc: 'Vera, the Archivist',
        description: 'An elderly woman with piercing eyes beckons you to a hidden bunker filled with ancient terminals. "The ship\'s black box is still out there, in the Industrial Zone. But I need power to decrypt it. Bring me a generator, and I\'ll show you what really happened to our ancestors."',
        requirements: [
            { type: 'structure', structure: 'generator', amount: 1 }
        ],
        rewards: [
            { type: 'silver', amount: 500 },
            { type: 'item', item: 'components', amount: 10 }
        ],
        completionMessage: 'Vera connects the generator. The screens flicker to life, showing fragmented logs. "The crash... it wasn\'t an accident. Someone sabotaged the navigation. But who? And why are they still hiding?"',
        dependsOn: 'quest_kael_2',
        unlocks: 'quest_vera_2',
    },
    {
        id: 'quest_vera_2',
        title: 'The Saboteur\'s Shadow',
        npc: 'Vera, the Archivist',
        description: 'Vera\'s hands shake as she shows you encrypted files. "I\'ve narrowed it down. The saboteur\'s descendants are still here, still working in secret. I need advanced scanning equipment to trace their signal. Bring me iron plates and components. We must expose the truth."',
        requirements: [
            { type: 'item', item: 'ironPlates', amount: 20 },
            { type: 'item', item: 'components', amount: 30 }
        ],
        rewards: [
            { type: 'item', item: 'biomass', amount: 15 },
            { type: 'silver', amount: 800 }
        ],
        completionMessage: 'The scan reveals a hidden facility. "There. That\'s where they\'re operating from. But we can\'t go alone. We need allies. And we need to be ready for what we\'ll find. The truth is darker than I imagined."',
        dependsOn: 'quest_vera_1',
        unlocks: 'quest_vera_3',
    },
    {
        id: 'quest_vera_3',
        title: 'Gathering the Evidence',
        npc: 'Vera, the Archivist',
        description: '"I need to build a case that can\'t be denied. Physical evidence from the crash site—mutated samples that prove the sabotage, advanced materials that show the technology used. Help me gather what we need to expose this conspiracy."',
        requirements: [
            { type: 'item', item: 'mutatedTwigs', amount: 25 },
            { type: 'item', item: 'uranium', amount: 10 },
            { type: 'item', item: 'ironIngot', amount: 30 }
        ],
        rewards: [
            { type: 'silver', amount: 1500 },
            { type: 'item', item: 'metalDetector', amount: 1 }
        ],
        completionMessage: '"This is it. The proof we need. The radiation signatures match the sabotage device. Someone wanted us stranded here. But why? What are they protecting? Or hiding from?"',
        dependsOn: 'quest_vera_2',
    },

    // Rook Arc: The Outcast's Gambit
    {
        id: 'quest_rook_1',
        title: 'Blood Money',
        npc: 'Rook, the Outcast',
        description: 'A scarred figure emerges from the shadows. "Name\'s Rook. I don\'t do pleasantries. I need someone expendable for a job. There\'s a cache of charcoal in a radiation hot zone. Everyone who\'s tried to get it has died. You look stupid enough to try. Interested?"',
        requirements: [
            { type: 'item', item: 'charcoal', amount: 50 }
        ],
        rewards: [
            { type: 'silver', amount: 600 },
            { type: 'item', item: 'stoneAxe', amount: 1 }
        ],
        completionMessage: 'Rook actually looks impressed. "You survived. Huh. Maybe you\'re not as dumb as you look. I might have more work for you. Real work. The kind that pays well and asks no questions."',
        unlocks: 'quest_rook_2',
    },
    {
        id: 'quest_rook_2',
        title: 'The Redemption Run',
        npc: 'Rook, the Outcast',
        description: 'Rook\'s usual cynicism cracks. "I was exiled for stealing medical supplies. But I was trying to save a kid. Dr. Chen can verify—if she\'ll talk to me. I need you to deliver these supplies to her clinic. Biomass for fuel, components for equipment. Maybe... maybe I can start making things right."',
        requirements: [
            { type: 'item', item: 'biomass', amount: 30 },
            { type: 'item', item: 'components', amount: 20 }
        ],
        rewards: [
            { type: 'item', item: 'cookedApple', amount: 10 },
            { type: 'silver', amount: 1000 }
        ],
        completionMessage: 'Dr. Chen accepts the supplies with tears in her eyes. "Tell Rook... tell him I never doubted him. He\'s welcome here." Rook nods silently when you relay the message. "Thanks. I owe you one. A real one."',
        dependsOn: 'quest_rook_1',
        unlocks: 'quest_rook_3',
    },
    {
        id: 'quest_rook_3',
        title: 'Sins of the Past',
        npc: 'Rook, the Outcast',
        description: '"The kid I tried to save... she didn\'t make it. But her family is still out there, struggling. I want to help them properly this time. They need food, water, shelter materials. Help me do this right, {{characterName}}. Help me prove I\'m more than my mistakes."',
        requirements: [
            { type: 'item', item: 'apple', amount: 50 },
            { type: 'item', item: 'water', amount: 50 },
            { type: 'item', item: 'wood', amount: 100 },
            { type: 'item', item: 'stone', amount: 100 }
        ],
        rewards: [
            { type: 'silver', amount: 1500 },
            { type: 'item', item: 'ironPlates', amount: 10 }
        ],
        completionMessage: '"They have a chance now. A real chance. You helped me do something good. In this wasteland, that\'s rare. You\'re alright, {{characterName}}. If you ever need someone to watch your back, you know where to find me."',
        dependsOn: 'quest_rook_2',
    },

    // Dr. Chen Arc: The Healer's Burden
    {
        id: 'quest_chen_1',
        title: 'Medicine for the Masses',
        npc: 'Dr. Yuki Chen',
        description: 'An exhausted doctor approaches. "I\'m Dr. Chen. I run the clinic in Sector 7. We\'re overwhelmed—radiation sickness, malnutrition, injuries. I need food and water to keep people alive. Can you help?"',
        requirements: [
            { type: 'item', item: 'apple', amount: 30 },
            { type: 'item', item: 'water', amount: 30 },
            { type: 'item', item: 'cookedApple', amount: 10 }
        ],
        rewards: [
            { type: 'silver', amount: 400 },
            { type: 'item', item: 'appleSeeds', amount: 5 }
        ],
        completionMessage: 'Dr. Chen\'s eyes well up. "Thank you. You\'ve saved lives today. Real lives. If you ever need medical supplies or just someone to talk to, come find me. We\'re all in this together."',
        dependsOn: 'quest_silas_2',
        unlocks: 'quest_chen_2',
    },
    {
        id: 'quest_chen_2',
        title: 'Building Hope',
        npc: 'Dr. Yuki Chen',
        description: '"The clinic needs expansion. More beds, better equipment, proper storage. I need construction materials and advanced components. Help me build something that will last, that will help people for years to come."',
        requirements: [
            { type: 'item', item: 'wood', amount: 100 },
            { type: 'item', item: 'stone', amount: 100 },
            { type: 'item', item: 'ironIngot', amount: 50 },
            { type: 'item', item: 'components', amount: 25 }
        ],
        rewards: [
            { type: 'silver', amount: 1500 },
            { type: 'item', item: 'biomass', amount: 20 }
        ],
        completionMessage: '"It\'s beautiful. A real medical facility. People won\'t have to suffer needlessly anymore. You\'ve given us more than supplies—you\'ve given us hope. Thank you, {{characterName}}."',
        dependsOn: 'quest_chen_1',
        unlocks: 'quest_chen_3',
    },
    {
        id: 'quest_chen_3',
        title: 'The Healer\'s Stand',
        npc: 'Dr. Yuki Chen',
        description: 'Dr. Chen\'s voice is urgent. "Marcus is demanding \'protection fees\' from my clinic. If I don\'t pay, he\'ll cut off my supply lines. But if I do, I can\'t afford medicine. I need to stockpile enough to be independent. Help me break free from his control."',
        requirements: [
            { type: 'item', item: 'biomass', amount: 50 },
            { type: 'item', item: 'charcoal', amount: 40 },
            { type: 'item', item: 'components', amount: 30 },
            { type: 'item', item: 'ironPlates', amount: 15 }
        ],
        rewards: [
            { type: 'silver', amount: 2000 },
            { type: 'item', item: 'cookedApple', amount: 20 }
        ],
        completionMessage: '"We\'re not helpless anymore. Marcus can\'t control us through fear and scarcity. You\'ve given us independence. The people won\'t forget this. Neither will I."',
        dependsOn: 'quest_chen_2',
    },
];
