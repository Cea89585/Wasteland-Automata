// src/lib/game-data/encounters.ts
import type { Resource, Item, LocationId } from "../game-types";

export type FixedEncounter = {
    type: 'positive';
    message: string;
    reward: {
        item: Resource | Item;
        amount: number;
    };
} | {
    type: 'negative';
    message: string;
    penalty: {
        type: 'health' | Resource | Item;
        amount: number;
    };
}

type LocationEncounters = {
    positive: FixedEncounter[];
    negative: FixedEncounter[];
}

export const encounters: Record<LocationId, LocationEncounters> = {
    outskirts: {
        positive: [
            { type: 'positive', message: "A wandering trader sees the look in your eye and gifts you a spare component.", reward: { item: 'components', amount: 1 } },
            { type: 'positive', message: "An abandoned camp still has something useful.", reward: { item: 'scrap', amount: 5 } },
            { type: 'positive', message: "You intercept a supply drone and salvage a part.", reward: { item: 'components', amount: 2 } },
            { type: 'positive', message: "A storm uncovers a buried cache near your camp.", reward: { item: 'wood', amount: 10 } },
            { type: 'positive', message: "A friendly scout leaves you a small care package.", reward: { item: 'apple', amount: 3 } },
            { type: 'positive', message: "A malfunctioning robot ejects a component before shutting down.", reward: { item: 'components', amount: 1 } },
            { type: 'positive', message: "You find a perfectly preserved can of pre-war peaches.", reward: { item: 'peach', amount: 2 } },
        ],
        negative: [
            { type: 'negative', message: "A wild beast scratches you during a frantic escape!", penalty: { type: 'health', amount: 10 } },
            { type: 'negative', message: "You trip in the dark and a glass bottle of water shatters in your pack.", penalty: { type: 'water', amount: 3 } },
            { type: 'negative', message: "A swarm of mutated insects ruins some of your food stash.", penalty: { type: 'apple', amount: 2 } },
            { type: 'negative', message: "You're ambushed by raiders and barely escape, dropping some scrap metal in the process.", penalty: { type: 'scrap', amount: 5 } },
            { type: 'negative', message: "A sudden landslide buries some of your recently gathered stone.", penalty: { type: 'stone', amount: 8 } },
            { type: 'negative', message: "Your trusty stone axe handle splinters and breaks during use.", penalty: { type: 'stoneAxe', amount: 1 } },
        ]
    },
    forest: {
        positive: [
            { type: 'positive', message: "You discover a patch of unusually vibrant berries that seem edible.", reward: { item: 'banana', amount: 3 } },
            { type: 'positive', message: "A fallen, ancient tree provides a massive amount of sturdy wood.", reward: { item: 'wood', amount: 15 } },
            { type: 'positive', message: "You find a pool of clear water filtered by glowing moss.", reward: { item: 'water', amount: 5 } },
            { type: 'positive', message: "The glowing mutated twigs seem to pulse in unison, revealing a hidden one.", reward: { item: 'mutatedTwigs', amount: 3 } },
        ],
        negative: [
            { type: 'negative', message: "Thorny vines snag your pack, tearing a hole and spilling some of your wood.", penalty: { type: 'wood', amount: 5 } },
            { type: 'negative', message: "You eat a strange-looking fruit and feel a wave of nausea.", penalty: { type: 'health', amount: 15 } },
            { type: 'negative', message: "You get lost in the dense woods, wasting time and energy.", penalty: { type: 'health', amount: 5 } },
             { type: 'negative', message: "A territorial creature with glowing eyes forces you to drop some of your food to escape.", penalty: { type: 'apple', amount: 4 } },
        ]
    },
    tunnels: {
        positive: [
            { type: 'positive', message: "You find a maintenance worker's old toolbox, containing a few components.", reward: { item: 'components', amount: 2 } },
            { type: 'positive', message: "A section of collapsed tunnel reveals a vein of iron ore.", reward: { item: 'scrap', amount: 10 } },
            { type: 'positive', message: "You find an emergency supply cache in a forgotten maintenance closet.", reward: { item: 'water', amount: 4 } },
        ],
        negative: [
            { type: 'negative', message: "A sudden tremor shakes dust from the ceiling, making you cough and wheeze.", penalty: { type: 'health', amount: 5 } },
            { type: 'negative', message: "You wade through a flooded section, and some of your scrap metal rusts away.", penalty: { type: 'scrap', amount: 5 } },
            { type: 'negative', message: "The darkness plays tricks on your eyes, you swing your axe at a shadow, damaging it.", penalty: { type: 'stoneAxe', amount: 1 } },
        ]
    },
    industrial: {
        positive: [
            { type: 'positive', message: "A dormant assembly line still holds a few pristine components.", reward: { item: 'components', amount: 4 } },
            { type: 'positive', message: "You find a stack of refined iron ingots forgotten in a warehouse.", reward: { item: 'ironIngot', amount: 2 } },
            { type: 'positive', message: "A backup generator has a small amount of fuel left.", reward: { item: 'charcoal', amount: 3 } },
        ],
        negative: [
            { type: 'negative', message: "You accidentally kick a leaking barrel of chemicals and get some on your skin.", penalty: { type: 'health', amount: 20 } },
            { type: 'negative', message: "A rusted catwalk collapses beneath you, you drop some heavy components in the fall.", penalty: { type: 'components', amount: 2 } },
            { type: 'negative', message: "A short-circuiting robot activates unexpectedly, forcing you to flee and leave some iron behind.", penalty: { type: 'ironIngot', amount: 1 } },
        ]
    },
    wasteland: {
        positive: [
            { type: 'positive', message: "You stumble upon a small, hidden oasis with clean water.", reward: { item: 'water', amount: 10 } },
            { type: 'positive', message: "The glint of the sun on sand reveals a partially buried piece of valuable electronics.", reward: { item: 'components', amount: 1 } },
            { type: 'positive', message: "You find the skeleton of a less fortunate scavenger, but their pack contains a few silver coins.", reward: { item: 'silver', amount: 25 } },
        ],
        negative: [
            { type: 'negative', message: "A sudden sandstorm scours you, leaving you weak and battered.", penalty: { type: 'health', amount: 25 } },
            { type: 'negative', message: "The intense heat causes some of your water to evaporate from your container.", penalty: { type: 'water', amount: 5 } },
            { type: 'negative', message: "A sand worm bursts from the ground, you drop your supplies in a panic.", penalty: { type: 'scrap', amount: 10 } },
        ]
    },
    bunker: {
        positive: [
            { type: 'positive', message: "You pry open a locked cabinet to find pristine, pre-war medical supplies.", reward: { item: 'water', amount: 5 } },
            { type: 'positive', message: "A still-functioning terminal gives you the code to a supply locker.", reward: { item: 'components', amount: 5 } },
            { type: 'positive', message: "You find a forgotten stash of MREs.", reward: { item: 'apple', amount: 10 } },
        ],
        negative: [
            { type: 'negative', message: "An automated turret activates and grazes you before powering down.", penalty: { type: 'health', amount: 30 } },
            { type: 'negative', message: "You accidentally trigger a fire suppression system, ruining some of your electronic components.", penalty: { type: 'components', amount: 3 } },
            { type: 'negative', message: "A sealed door slams shut behind you, forcing you to use valuable resources to pry it open.", penalty: { type: 'scrap', amount: 15 } },
        ]
    }
};
