// src/lib/game-data/quests.ts
import type { Resource, Item, LocationId } from '../game-types';

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
} | {
    type: 'location_unlock';
    location: LocationId;
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

export const baseQuests: Quest[] = [
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
        unlocks: 'quest_silas_glass_1'
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
            { type: 'location_unlock', location: 'wasteland' }
        ],
        completionMessage: 'Kael expertly fits the plates onto his device. "Perfect. The signal will be clean. You\'ve done well. This old metal detector is surplus to my needs; it should serve you better. We\'re close to finishing this project."',
        dependsOn: 'quest_kael_mining',
        unlocks: 'quest_kael_drone_1'
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
        unlocks: 'quest_elara_preserve_1'
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
            { type: 'item', item: 'carrotSeeds', amount: 5 },
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
            { type: 'item', item: 'cornSeeds', amount: 5 },
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
        unlocks: 'quest_anya_lab_1'
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
        dependsOn: 'quest_kael_drone_2',
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
        unlocks: 'quest_marcus_industry_1'
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
            { type: 'item', item: 'components', amount: 10 },
            { type: 'location_unlock', location: 'industrial' }
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
            { type: 'silver', amount: 800 },
            { type: 'location_unlock', location: 'bunker' }
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
        unlocks: 'quest_vera_4'
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
        unlocks: 'quest_rook_4'
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
        unlocks: 'quest_chen_4'
    },
    // Finn Arc: The Angler's Legacy
    // Zone 1: Toxic Puddle
    {
        id: 'quest_finn_1',
        title: 'Ripples in the Water',
        npc: 'Finn, the River Keeper',
        description: 'A calm man sits by the water\'s edge, fashioning a hook from scrap metal. "The water speaks, if you listen," he says softly. "But the fish are wary. They know the taste of poison. Prove you have the patience of the river. Catch me some simple fish, and I\'ll share my catch."',
        requirements: [
            { type: 'item', item: 'mutantMinnow', amount: 3 }
        ],
        rewards: [
            { type: 'silver', amount: 100 },
            { type: 'item', item: 'cookedApple', amount: 5 }
        ],
        completionMessage: 'Finn nods slowly. "Good. You have patience. Hunger is a noise that scares the fish. Eat, and sit with me awhile."',
        dependsOn: 'quest_silas_2',
        unlocks: 'quest_finn_2',
    },
    {
        id: 'quest_finn_2',
        title: 'Cleaning the Puddle',
        npc: 'Finn, the River Keeper',
        description: '"The river is choked with the old world\'s refuse," Finn sighs. "It sickens the water. Do a service for the spirits of the stream. Pull out the garbage that poisons their home."',
        requirements: [
            { type: 'item', item: 'rustyCan', amount: 3 }
        ],
        rewards: [
            { type: 'silver', amount: 150 },
            { type: 'item', item: 'scrap', amount: 5 }
        ],
        completionMessage: '"You have cleared a small space for life to breathe. The water thanks you, and so do I. But there are larger waters, and larger troubles ahead."',
        dependsOn: 'quest_finn_1',
        unlocks: 'quest_finn_3',
    },

    // Zone 2: Contaminated Creek
    {
        id: 'quest_finn_3',
        title: 'The Flow of Life',
        npc: 'Finn, the River Keeper',
        description: '"The creek flows faster, carrying different life. The Sludge Bass are resilient creatures, swimming through the muck. Catch them, and you prove you can handle the current."',
        requirements: [
            { type: 'item', item: 'sludgeBass', amount: 5 }
        ],
        rewards: [
            { type: 'silver', amount: 200 },
            { type: 'item', item: 'components', amount: 3 }
        ],
        completionMessage: '"Strong fish for a strong angler. You are learning the rhythm of the waters."',
        dependsOn: 'quest_finn_2',
        unlocks: 'quest_finn_4',
    },
    {
        id: 'quest_finn_4',
        title: 'Creek Scavenger',
        npc: 'Finn, the River Keeper',
        description: '"The creek hides more than just fish. Old things, lost things. And carp that have seen too much radiation. Bring me what lies beneath the surface."',
        requirements: [
            { type: 'item', item: 'oldBoot', amount: 3 },
            { type: 'item', item: 'irradiatedCarp', amount: 3 }
        ],
        rewards: [
            { type: 'silver', amount: 250 },
            { type: 'item', item: 'ironIngot', amount: 3 }
        ],
        completionMessage: '"One man\'s trash is another\'s treasure... or at least, a reminder of what was lost. You are doing well."',
        dependsOn: 'quest_finn_3',
        unlocks: 'quest_finn_5',
    },

    // Zone 3: Reactor Pond
    {
        id: 'quest_finn_5',
        title: 'Bioluminescence',
        npc: 'Finn, the River Keeper',
        description: '"The Reactor Pond... a place of beautiful danger. The fish there hold the light of the sickness. Glowfish. They are like stars in the dark water. Bring me their light."',
        requirements: [
            { type: 'item', item: 'glowfish', amount: 5 }
        ],
        rewards: [
            { type: 'silver', amount: 300 },
            { type: 'item', item: 'components', amount: 5 }
        ],
        completionMessage: 'Finn holds the glowing fish with reverence. "Beautiful. Terrible, but beautiful. You walk where others fear to tread."',
        dependsOn: 'quest_finn_4',
        unlocks: 'quest_finn_6',
    },
    {
        id: 'quest_finn_6',
        title: 'Reactor Hazards',
        npc: 'Finn, the River Keeper',
        description: '"The heart of the pond is poison. Shards of the old core still leak their venom. And a beast guards them. A Mutant Catfish, swollen with power. Cleanse the pond, if you dare."',
        requirements: [
            { type: 'item', item: 'reactorCoreShard', amount: 3 },
            { type: 'item', item: 'mutantCatfish', amount: 1 }
        ],
        rewards: [
            { type: 'silver', amount: 400 },
            { type: 'item', item: 'uranium', amount: 2 }
        ],
        completionMessage: '"You have faced the beast and the poison, and survived. You are no longer just a fisherman. You are a guardian of the waters."',
        dependsOn: 'quest_finn_5',
        unlocks: 'quest_finn_7',
    },

    // Zone 4: Flooded Bunker
    {
        id: 'quest_finn_7',
        title: 'Secrets of the Bunker',
        npc: 'Finn, the River Keeper',
        description: '"Deep below, the old war bunkers are flooded. The Carp there have adapted to the darkness and the steel. They are tough, like the soldiers who once lived there. Find them."',
        requirements: [
            { type: 'item', item: 'bunkerCarp', amount: 5 }
        ],
        rewards: [
            { type: 'silver', amount: 500 },
            { type: 'item', item: 'ironPlates', amount: 5 }
        ],
        completionMessage: '"Hard scales for a hard life. You are proving to be as adaptable as they are."',
        dependsOn: 'quest_finn_6',
        unlocks: 'quest_finn_8',
    },
    {
        id: 'quest_finn_8',
        title: 'Military Rations',
        npc: 'Finn, the River Keeper',
        description: '"The soldiers left behind more than just ghosts. Their supplies, their history... and the eels that weave through it all. Scavenge the past, angler."',
        requirements: [
            { type: 'item', item: 'militaryRation', amount: 3 },
            { type: 'item', item: 'caveEel', amount: 3 }
        ],
        rewards: [
            { type: 'silver', amount: 600 },
            { type: 'item', item: 'components', amount: 10 }
        ],
        completionMessage: '"The taste of the old world... stale, but sustaining. You retrieve history from the depths."',
        dependsOn: 'quest_finn_7',
        unlocks: 'quest_finn_9',
    },

    // Zone 5: Chemical Lake
    {
        id: 'quest_finn_9',
        title: 'Chemical Adaptation',
        npc: 'Finn, the River Keeper',
        description: '"The Chemical Lake is a cauldron of change. The Acid Swimmers don\'t just survive the burn; they embrace it. Show me this miracle of adaptation."',
        requirements: [
            { type: 'item', item: 'acidSwimmer', amount: 5 }
        ],
        rewards: [
            { type: 'silver', amount: 700 },
            { type: 'item', item: 'biomass', amount: 10 }
        ],
        completionMessage: '"Life finds a way, even in acid. You are witnessing the new world\'s birth."',
        dependsOn: 'quest_finn_8',
        unlocks: 'quest_finn_10',
    },
    {
        id: 'quest_finn_10',
        title: 'Toxic Ecology',
        npc: 'Finn, the River Keeper',
        description: '"The chemicals crystallize into strange forms. And the trout... they have become something else entirely. Bring me samples of this twisted ecology."',
        requirements: [
            { type: 'item', item: 'strangeCrystal', amount: 3 },
            { type: 'item', item: 'toxicTrout', amount: 3 }
        ],
        rewards: [
            { type: 'silver', amount: 800 },
            { type: 'item', item: 'components', amount: 15 }
        ],
        completionMessage: '"Crystals of poison, fish of toxins. You handle them with care. You are a master of the hazardous harvest."',
        dependsOn: 'quest_finn_9',
        unlocks: 'quest_finn_11',
    },

    // Zone 6: Deep Crater
    {
        id: 'quest_finn_11',
        title: 'From the Stars',
        npc: 'Finn, the River Keeper',
        description: '"The crater holds water touched by the void. The Crater Dwellers have seen the sky fall. Catch them, and touch the cosmos."',
        requirements: [
            { type: 'item', item: 'craterDweller', amount: 5 }
        ],
        rewards: [
            { type: 'silver', amount: 1000 },
            { type: 'item', item: 'uranium', amount: 5 }
        ],
        completionMessage: '"To hold a creature of the crater is to hold a piece of the sky. You have reached far, angler."',
        dependsOn: 'quest_finn_10',
        unlocks: 'quest_finn_12',
    },
    {
        id: 'quest_finn_12',
        title: 'Cosmic Debris',
        npc: 'Finn, the River Keeper',
        description: '"The stars left fragments behind. And in the deepest crushing dark, the Depth Fish swim. Bring me the debris of the heavens and the monsters of the deep."',
        requirements: [
            { type: 'item', item: 'meteorFragment', amount: 3 },
            { type: 'item', item: 'depthFish', amount: 1 }
        ],
        rewards: [
            { type: 'silver', amount: 1200 },
            { type: 'item', item: 'ironIngot', amount: 10 }
        ],
        completionMessage: '"You have dredged the depths of a falling star. There is little left that can surprise you now."',
        dependsOn: 'quest_finn_11',
        unlocks: 'quest_finn_13',
    },

    // Zone 7: Sunken City
    {
        id: 'quest_finn_13',
        title: 'Relics of the Sunken City',
        npc: 'Finn, the River Keeper',
        description: '"The old city sleeps beneath the waves. The Urban Scavenger Fish pick through the bones of our ancestors. Catch them, and let us see what they have found."',
        requirements: [
            { type: 'item', item: 'urbanScavengerFish', amount: 5 }
        ],
        rewards: [
            { type: 'silver', amount: 1500 },
            { type: 'item', item: 'components', amount: 20 }
        ],
        completionMessage: '"They feast on the past. By catching them, you reclaim a piece of it."',
        dependsOn: 'quest_finn_12',
        unlocks: 'quest_finn_14',
    },
    {
        id: 'quest_finn_14',
        title: 'Lost Treasures',
        npc: 'Finn, the River Keeper',
        description: '"We are at the end of the river, you and I. The Sunken City hides the Golden City Fish, a legend made flesh. And the currency of the dead world still floats there. Bring me these final treasures, and claim your legacy."',
        requirements: [
            { type: 'item', item: 'preWarCurrency', amount: 3 },
            { type: 'item', item: 'goldenCityFish', amount: 1 }
        ],
        rewards: [
            { type: 'silver', amount: 5000 },
            { type: 'item', item: 'ancientArtifact', amount: 1 }
        ],
        completionMessage: 'Finn bows low. "I have nothing left to teach you. You are the master of all waters, from the toxic puddles to the sunken depths. The river flows in you now. Go, with my blessing."',
        dependsOn: 'quest_finn_13',
    }];

// --- Extension Quests ---

const silasGlassQuests: Quest[] = [
    {
        id: 'quest_silas_glass_1',
        title: 'Sand and Fire',
        npc: 'Silas, the Watcher',
        description: '"You\'ve mastered the basics," Silas says, kicking at the dirt. "But to truly thrive, you need to master the elements. Sand is everywhere. Fire is in your furnace. Combine them. Bring me sand, and show me you can gather the raw materials for something... cleaner."',
        requirements: [
            { type: 'item', item: 'sand', amount: 50 }
        ],
        rewards: [
            { type: 'silver', amount: 100 },
            { type: 'item', item: 'wood', amount: 20 }
        ],
        completionMessage: '"Good. It\'s coarse, useless on its own. But you\'re going to change that."',
        dependsOn: 'quest_silas_3',
        unlocks: 'quest_silas_glass_2'
    },
    {
        id: 'quest_silas_glass_2',
        title: 'Clear Vision',
        npc: 'Silas, the Watcher',
        description: '"Now, put that furnace to work. Melt the sand. Shape it. Create glass tubes. They are fragile, yes, but they hold the potential for chemistry, for preservation. Bring me proof of your craftsmanship."',
        requirements: [
            { type: 'item', item: 'glassTube', amount: 10 }
        ],
        rewards: [
            { type: 'silver', amount: 250 },
            { type: 'item', item: 'components', amount: 5 }
        ],
        completionMessage: '"Clear, smooth, perfect. You\'re not just banging rocks together anymore. You\'re refining the world around you. Keep this up."',
        dependsOn: 'quest_silas_glass_1',
        // Unlocks Elara's preservation arc if she is ready, but we handle that link in Elara's quest chain or via direct dependency if possible.
        // Since we can only have one 'unlocks', and Elara's start depends on her own intro, we'll link Elara's new quest to 'quest_elara_1' but it logically requires glass.
        // We will make 'quest_elara_preserve_1' depend on 'quest_elara_1', and we'll trust the player finds the glass tech via Silas.
    }
];

const elaraPreserveQuests: Quest[] = [
    {
        id: 'quest_elara_preserve_1',
        title: 'Sweet Savings',
        npc: 'Elara, the Hoarder',
        description: '"Food rots," Elara grumbles, tossing a mushy apple aside. "It\'s a waste. But I hear you can make glass now. Glass jars... they stop the rot. Pickle me some peaches. Make them last forever. I\'ll pay well for stability."',
        requirements: [
            { type: 'item', item: 'pickledPeaches', amount: 5 }
        ],
        rewards: [
            { type: 'silver', amount: 600 },
            { type: 'item', item: 'components', amount: 10 }
        ],
        completionMessage: 'Elara holds the jar up to the light. "Beautiful. suspended in time. This... this is security. thank you."',
        dependsOn: 'quest_elara_1',
        unlocks: 'quest_elara_preserve_2'
    },
    {
        id: 'quest_elara_preserve_2',
        title: 'The Long Winter',
        npc: 'Elara, the Hoarder',
        description: '"I have a feeling," Elara whispers. "A long, hard season is coming. Or maybe just a slow Tuesday. Either way, I need to stock up. Fill my shelves. Jars, pickles... everything. Help me build a stockpile that will outlast us all."',
        requirements: [
            { type: 'item', item: 'pickledPeaches', amount: 20 },
            { type: 'item', item: 'glassJar', amount: 10 }
        ],
        rewards: [
            { type: 'silver', amount: 1500 },
            { type: 'item', item: 'ancientArtifact', amount: 1 }
        ],
        completionMessage: '"Enough to feed a small army... or me, for a month. You\'ve done well, scavenger. You understand the value of keeping things."',
        dependsOn: 'quest_elara_preserve_1'
    }
];

const kaelDroneQuests: Quest[] = [
    {
        id: 'quest_kael_drone_1',
        title: 'Eyes in the Sky',
        npc: 'Kael, the Engineer',
        description: '"We\'re stuck on the ground," Kael complains, looking at the clouds. "I need data from the upper atmosphere, and I need scouts that don\'t get eaten by mutants. Build a Drone Bay. Let\'s automate our reconnaissance."',
        requirements: [
            { type: 'structure', structure: 'droneBay', amount: 1 }
        ],
        rewards: [
            { type: 'silver', amount: 1000 },
            { type: 'item', item: 'components', amount: 20 }
        ],
        completionMessage: '"It works! Look at that telemetry. We\'re not blind anymore. But a single drone is just a toy. We need a swarm."',
        dependsOn: 'quest_kael_2',
        unlocks: 'quest_kael_drone_2'
    },
    {
        id: 'quest_kael_drone_2',
        title: 'Swarm Logistics',
        npc: 'Kael, the Engineer',
        description: '"To manage a fleet, I need advanced processing power and raw materials for the chassis. Bring me the good stuff. Components for the brains, Iron for the bodies."',
        requirements: [
            { type: 'item', item: 'components', amount: 50 },
            { type: 'item', item: 'ironIngot', amount: 20 }
        ],
        rewards: [
            { type: 'silver', amount: 1200 },
            { type: 'item', item: 'uranium', amount: 5 }
        ],
        completionMessage: '"Excellent. The network is growing. Soon, we\'ll have eyes on every sector. You\'re building the future, my friend."',
        dependsOn: 'quest_kael_drone_1',
        unlocks: 'quest_marcus_1' // Re-linking Marcus arc here
    }
];

const anyaLabQuests: Quest[] = [
    {
        id: 'quest_anya_lab_1',
        title: 'Sterile Equipment',
        npc: 'Anya, the Botanist',
        description: '"The map was just the beginning," Anya says, pacing the lab. "I found a pristine zone, untouched by radiation. To study the samples I\'ll find there, I need sterile equipment. Glass tubes, sealed and pure. And iron plates to reinforce the clean room."',
        requirements: [
            { type: 'item', item: 'glassTube', amount: 15 },
            { type: 'item', item: 'ironPlates', amount: 10 }
        ],
        rewards: [
            { type: 'silver', amount: 800 },
            { type: 'item', item: 'biomass', amount: 15 }
        ],
        completionMessage: '"Perfect. No contaminants. We can finally do real science here."',
        dependsOn: 'quest_anya_map_3',
        unlocks: 'quest_anya_lab_2'
    },
    {
        id: 'quest_anya_lab_2',
        title: 'Exotic Cultivation',
        npc: 'Anya, the Botanist',
        description: '"I want to try growing something... fragile. Not these mutated weeds. Lemons, Bananas. Old world fruits that need care. Bring me a stockpile of them, I need to extract their seeds and genetic material to adapt them to our soil."',
        requirements: [
            { type: 'item', item: 'lemon', amount: 20 },
            { type: 'item', item: 'banana', amount: 20 }
        ],
        rewards: [
            { type: 'silver', amount: 1200 },
            { type: 'item', item: 'biomass', amount: 50 }
        ],
        completionMessage: '"The DNA is remarkably stable. With some splicing... yes. We might have orchards again one day."',
        dependsOn: 'quest_anya_lab_1'
    }
];

const marcusIndustryQuests: Quest[] = [
    {
        id: 'quest_marcus_industry_1',
        title: 'Mass Production',
        npc: 'Marcus, the Salvage King',
        description: '"Small dealings are boring," Marcus yawns. "I want to export. Pickles, preserved goods. They sell for a fortune in the inner sectors. I need containers, and I need fuel to transport them. Fill the order."',
        requirements: [
            { type: 'item', item: 'glassJar', amount: 50 },
            { type: 'item', item: 'charcoal', amount: 100 }
        ],
        rewards: [
            { type: 'silver', amount: 3000 },
            { type: 'item', item: 'preWarCurrency', amount: 10 }
        ],
        completionMessage: '"Now that is volume! You\'re thinking like a tycoon. We\'re going to be very rich."',
        dependsOn: 'quest_marcus_3',
        unlocks: 'quest_final_monument'
    }
];

const finalQuests: Quest[] = [
    {
        id: 'quest_final_monument',
        title: 'The Rebuilder\'s Legacy',
        npc: 'Silas, the Watcher',
        description: '"You\'ve done it all," Silas looks around at the thriving settlement. "Mines, farms, drones, factories. But what do we leave behind? A monument. A testament to our refusal to die. Build the foundation of a new city. Bring everything."',
        requirements: [
            { type: 'item', item: 'stone', amount: 1000 },
            { type: 'item', item: 'wood', amount: 500 },
            { type: 'item', item: 'ironIngot', amount: 200 },
            { type: 'item', item: 'glassJar', amount: 100 }
        ],
        rewards: [
            { type: 'silver', amount: 10000 },
            { type: 'item', item: 'treasureCache', amount: 1 }
        ],
        completionMessage: '"It stands tall. A beacon. As long as this stands, humanity remains. You did good, kid. You did real good."',
        dependsOn: 'quest_marcus_industry_1'
    }
];

const rookExtensionQuests: Quest[] = [
    {
        id: 'quest_rook_4',
        title: 'The Outcast\'s Outpost',
        npc: 'Rook, the Outcast',
        description: '"I\'m done hiding in the shadows," Rook says, his jaw set. "I want to build a place where people like me—the ones the world gave up on—can find a home. A real outpost, fortified and self-sufficient. I need the materials to make it a reality. You with me?"',
        requirements: [
            { type: 'item', item: 'wood', amount: 300 },
            { type: 'item', item: 'stone', amount: 300 },
            { type: 'item', item: 'ironPlates', amount: 50 },
            { type: 'item', item: 'components', amount: 20 }
        ],
        rewards: [
            { type: 'silver', amount: 2500 },
            { type: 'item', item: 'ancientArtifact', amount: 1 }
        ],
        completionMessage: '"It\'s solid. A beacon in the dark. Thank you, {{characterName}}. You\'re more than just a scavenger. You\'re a builder."',
        dependsOn: 'quest_rook_3'
    }
];

const chenExtensionQuests: Quest[] = [
    {
        id: 'quest_chen_4',
        title: 'Wasteland Wellness',
        npc: 'Dr. Yuki Chen',
        description: '"We\'re expanding the clinic\'s reach," Dr. Chen explains, showing you a map of the surrounding settlements. "We need to send out medical kits. Glass jars for the tinctures, pickled peaches for nutrition, and uranium for the portable sterilization units. It\'s a lot to ask, but it will save hundreds."',
        requirements: [
            { type: 'item', item: 'glassJar', amount: 30 },
            { type: 'item', item: 'pickledPeaches', amount: 20 },
            { type: 'item', item: 'uranium', amount: 15 }
        ],
        rewards: [
            { type: 'silver', amount: 3500 },
            { type: 'item', item: 'biomass', amount: 100 }
        ],
        completionMessage: '"These kits... they\'re a miracle. You\'ve extended our reach further than I ever thought possible. The wasteland is a little less cruel today because of you."',
        dependsOn: 'quest_chen_3'
    }
];

const veraExtensionQuests: Quest[] = [
    {
        id: 'quest_vera_4',
        title: 'The Signal',
        npc: 'Vera, the Archivist',
        description: '"The facility I found... it\'s transmitting," Vera says, her voice trembling with excitement. "A signal from before the fall. But my antenna is too small, too weak. I need a high-gain array. Components for the logic, iron plates for the dish, and glass tubes for the vacuum seals."',
        requirements: [
            { type: 'item', item: 'components', amount: 100 },
            { type: 'item', item: 'ironPlates', amount: 50 },
            { type: 'item', item: 'glassTube', amount: 10 }
        ],
        rewards: [
            { type: 'silver', amount: 4000 },
            { type: 'item', item: 'preWarTech', amount: 5 }
        ],
        completionMessage: '"The signal... it\'s clear now. It\'s a voice from the past, calling to us. We\'re not alone in history. Thank you for giving the ancestors a voice again."',
        dependsOn: 'quest_vera_3'
    }
];

const newQuests = [
    ...silasGlassQuests,
    ...elaraPreserveQuests,
    ...kaelDroneQuests,
    ...anyaLabQuests,
    ...marcusIndustryQuests,
    ...rookExtensionQuests,
    ...chenExtensionQuests,
    ...veraExtensionQuests,
    ...finalQuests
];

export const quests: Quest[] = [
    ...baseQuests,
    ...newQuests
];
