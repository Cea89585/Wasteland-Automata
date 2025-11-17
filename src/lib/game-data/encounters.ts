// src/lib/game-data/encounters.ts
import type { Resource, Item } from "../game-types";

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

export const positiveEncounters: FixedEncounter[] = [
    { type: 'positive', message: "A wandering trader sees the look in your eye and gifts you a spare component.", reward: { item: 'components', amount: 1 } },
    { type: 'positive', message: "An abandoned camp still has something useful.", reward: { item: 'scrap', amount: 5 } },
    { type: 'positive', message: "You intercept a supply drone and salvage a part.", reward: { item: 'components', amount: 2 } },
    { type: 'positive', message: "A storm uncovers a buried cache near your camp.", reward: { item: 'wood', amount: 10 } },
    { type: 'positive', message: "A friendly scout leaves you a small care package.", reward: { item: 'apple', amount: 3 } },
    { type: 'positive', message: "A malfunctioning robot ejects a component before shutting down.", reward: { item: 'components', amount: 1 } },
];

export const negativeEncounters: FixedEncounter[] = [
    { type: 'negative', message: "A wild beast scratches you during a frantic escape!", penalty: { type: 'health', amount: 10 } },
    { type: 'negative', message: "You trip in the dark and a glass bottle of water shatters in your pack.", penalty: { type: 'water', amount: 3 } },
    { type: 'negative', message: "A swarm of mutated insects ruins some of your food stash.", penalty: { type: 'apple', amount: 2 } },
    { type: 'negative', message: "You're ambushed by raiders and barely escape, dropping some scrap metal in the process.", penalty: { type: 'scrap', amount: 5 } },
    { type: 'negative', message: "A sudden landslide buries some of your recently gathered stone.", penalty: { type: 'stone', amount: 8 } },
    { type: 'negative', message: "Your trusty stone axe handle splinters and breaks during use.", penalty: { type: 'stoneAxe', amount: 1 } },
];
