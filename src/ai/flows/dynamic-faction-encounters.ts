// src/ai/flows/dynamic-faction-encounters.ts
'use server';

/**
 * @fileOverview Dynamically generates faction encounters based on location and environment.
 *
 * - generateFactionEncounter - A function that generates a dynamic faction encounter.
 * - FactionEncounterInput - The input type for the generateFactionEncounter function.
 * - FactionEncounterOutput - The return type for the generateFactionEncounter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FactionEncounterInputSchema = z.object({
  location: z.string().describe('The current location of the player.'),
  environment: z.string().describe('The environmental conditions of the location.'),
  factions: z.array(z.string()).describe('The names of the possible factions in the area.'),
});
export type FactionEncounterInput = z.infer<typeof FactionEncounterInputSchema>;

const FactionEncounterOutputSchema = z.object({
  faction: z.string().describe('The faction encountered.'),
  description: z.string().describe('A description of the encounter.'),
});
export type FactionEncounterOutput = z.infer<typeof FactionEncounterOutputSchema>;

export async function generateFactionEncounter(input: FactionEncounterInput): Promise<FactionEncounterOutput> {
  return factionEncounterFlow(input);
}

const factionEncounterPrompt = ai.definePrompt({
  name: 'factionEncounterPrompt',
  input: {schema: FactionEncounterInputSchema},
  output: {schema: FactionEncounterOutputSchema},
  prompt: `You are creating a dynamic encounter for a player in a post-apocalyptic game.

  The player is currently in the following location: {{{location}}}
  The environment is described as: {{{environment}}}
  The possible factions in this area are: {{#each factions}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Generate a short description of an encounter with one of these factions. Include which faction was encountered.  The description should describe the scene, the faction's demeanor, and the immediate implications for the player.
  Do not offer choices to the player or suggest any follow-up actions. Just describe the scene.
`,
});

const factionEncounterFlow = ai.defineFlow(
  {
    name: 'factionEncounterFlow',
    inputSchema: FactionEncounterInputSchema,
    outputSchema: FactionEncounterOutputSchema,
  },
  async input => {
    const {output} = await factionEncounterPrompt(input);
    return output!;
  }
);
