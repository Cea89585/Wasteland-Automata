// src/lib/game-data/lore.ts
import type { LoreEntry } from '../game-types';

export const loreEntries: LoreEntry[] = [
    // History - The Crash
    {
        id: 'lore_crash_intro',
        title: 'The Day the Sky Fell',
        content: 'Generations ago, the colony ship Prometheus descended toward this planet, carrying ten thousand souls seeking a new home. The landing was supposed to be controlled, calculated. Instead, the ship tore through the atmosphere like a meteor, breaking apart across hundreds of kilometers. Survivors scattered across the wreckage, forming isolated communities in the ruins.',
        category: 'history',
        unlockedBy: 'quest_silas_1',
    },
    {
        id: 'lore_sabotage',
        title: 'The Sabotage',
        content: 'Vera\'s research has uncovered the truth: the crash wasn\'t an accident. Someone aboard the Prometheus deliberately disabled the navigation systems moments before atmospheric entry. The saboteur\'s identity remains unknown, but their descendants are still here, still hiding. What were they trying to prevent? Or protect?',
        category: 'history',
        unlockedBy: 'quest_vera_1',
    },
    {
        id: 'lore_conspiracy',
        title: 'The Hidden Facility',
        content: 'Deep scans reveal a pre-crash facility, built before the Prometheus even launched. Someone knew this planet existed. Someone planned for the crash. The facility\'s purpose remains unclear, but its energy signature suggests it\'s still operational. What secrets does it hold?',
        category: 'history',
        unlockedBy: 'quest_vera_2',
    },

    // Characters
    {
        id: 'lore_silas_past',
        title: 'Silas: The Watcher\'s Burden',
        content: 'Silas was only eight when the Prometheus crashed. He watched his parents die in the initial impact, crushed beneath falling debris. Rescued by a security officer, he learned to survive through vigilance and distrust. Now he watches over newcomers, testing them, because he knows the wasteland shows no mercy to the weak or foolish.',
        category: 'character',
        unlockedBy: 'quest_silas_3',
    },
    {
        id: 'lore_kael_dream',
        title: 'Kael: The Engineer\'s Vision',
        content: 'Kael\'s great-grandmother was the Prometheus\'s chief engineer. Her logs, passed down through generations, speak of a backup communications array—a way to contact other colony ships, other survivors. Kael has dedicated his life to rebuilding that dream, believing technology can unite the scattered remnants of humanity.',
        category: 'character',
        unlockedBy: 'quest_kael_2',
    },
    {
        id: 'lore_marcus_empire',
        title: 'Marcus: The Salvage King\'s Rise',
        content: 'Marcus\'s grandfather was the Prometheus\'s quartermaster, controlling all supplies. Marcus inherited more than just salvage—he inherited the belief that control of resources means control of people. His operation has grown from a small scavenging crew to a sprawling network of workers, traders, and enforcers. He sees himself as bringing order to chaos. Others see a tyrant in the making.',
        category: 'character',
        unlockedBy: 'quest_marcus_3',
    },
    {
        id: 'lore_vera_knowledge',
        title: 'Vera: Keeper of Secrets',
        content: 'Vera is one of the oldest survivors, old enough to remember stories from those who witnessed the crash firsthand. She maintains the ship\'s surviving data cores, preserving knowledge that others have forgotten. But she\'s also discovered something troubling: entire sections of the ship\'s logs have been deliberately erased. Someone is hiding the truth.',
        category: 'character',
        unlockedBy: 'quest_vera_3',
    },
    {
        id: 'lore_rook_exile',
        title: 'Rook: The Outcast\'s Tale',
        content: 'Rook was exiled from Settlement Gamma for theft—medical supplies meant for the settlement\'s clinic. What the council didn\'t know: he was trying to save a dying child whose parents couldn\'t afford treatment. The child died anyway. Rook carries that failure like a scar, working dangerous jobs in the wasteland, seeking redemption he\'s not sure he deserves.',
        category: 'character',
        unlockedBy: 'quest_rook_3',
    },
    {
        id: 'lore_chen_oath',
        title: 'Dr. Chen: The Healer\'s Oath',
        content: 'Dr. Yuki Chen\'s ancestor was the Prometheus\'s chief medical officer. The family has maintained a clinic for three generations, treating anyone who needs help regardless of ability to pay. Chen has seen the wasteland\'s cruelty firsthand—radiation sickness, starvation, violence. She refuses to let economics determine who lives and who dies, even if it means standing against those in power.',
        category: 'character',
        unlockedBy: 'quest_chen_3',
    },

    // Locations
    {
        id: 'lore_industrial_zone',
        title: 'The Industrial Zone',
        content: 'The Industrial Zone was once the Prometheus\'s manufacturing sector, where raw materials were processed and components assembled. Now it\'s a maze of twisted metal and radiation hot spots. Scavengers brave enough to enter find valuable components—and often don\'t come back. Strange energy readings suggest some machinery is still active, powered by unknown sources.',
        category: 'location',
        unlockedBy: 'quest_anya_map_3',
    },
    {
        id: 'lore_wasteland_mutation',
        title: 'The Mutated Wasteland',
        content: 'The planet\'s native flora has been transformed by radiation from the crash. Plants glow with bioluminescence, grow at impossible rates, and exhibit properties that defy conventional biology. Anya\'s research suggests the mutations aren\'t random—they\'re adaptive, as if the planet itself is responding to the human presence.',
        category: 'location',
        unlockedBy: 'quest_anya_1',
    },

    // Technology
    {
        id: 'lore_generator_tech',
        title: 'Power Generation',
        content: 'The Prometheus used advanced fusion generators, but most were destroyed in the crash. Survivors have cobbled together makeshift generators using salvaged components and biomass fuel. The technology is crude but effective, providing enough power to run basic automation. Some believe intact fusion cores still exist, buried in the deepest wreckage.',
        category: 'technology',
        unlockedBy: 'quest_vera_1',
    },
    {
        id: 'lore_automation',
        title: 'Automated Systems',
        content: 'Before the crash, the Prometheus relied heavily on automation—mining drones, construction robots, resource processors. Most were lost, but fragments of that technology survive. Kael and others are slowly rebuilding automated systems, dreaming of a future where machines handle the dangerous work, freeing humans to rebuild civilization.',
        category: 'technology',
        unlockedBy: 'quest_kael_1',
    },
];

// Helper function to get lore entries by category
export const getLoreByCategory = (category: LoreEntry['category']): LoreEntry[] => {
    return loreEntries.filter(entry => entry.category === category);
};

// Helper function to get lore entry by ID
export const getLoreById = (id: string): LoreEntry | undefined => {
    return loreEntries.find(entry => entry.id === id);
};
