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
  description: z.string().describe('A one-paragraph description of the encounter.'),
});
export type FactionEncounterOutput = z.infer<typeof FactionEncounterOutputSchema>;

export async function generateFactionEncounter(input: FactionEncounterInput): Promise<FactionEncounterOutput> {
  return factionEncounterFlow(input);
}

const factionEncounterPrompt = ai.definePrompt({
  name: 'factionEncounterPrompt',
  input: {schema: FactionEncounterInputSchema},
  output: {schema: FactionEncounterOutputSchema},
  prompt: `You are creating a short, atmospheric encounter for a player in a post-apocalyptic game.

  The player is currently in the following location: {{{location}}}
  The environment is described as: {{{environment}}}
  The possible factions in this area are: {{#each factions}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Generate a short, single-paragraph description of an encounter with one of these factions. Include which faction was encountered.
  
  The description should be purely narrative. Do not offer choices to the player, suggest any follow-up actions, or describe any rewards or penalties. Just describe the scene.
  
  Always return a valid JSON object adhering to the output schema.
`,
});

const factionEncounterFlow = ai.defineFlow(
  {
    name: 'factionEncounterFlow',
    inputSchema: FactionEncounterInputSchema,
    outputSchema: FactionEncounterOutputSchema,
  },
  async input => {
    // Removing the faulty try/catch block to allow errors to surface properly for debugging.
    const {output} = await factionEncounterPrompt(input);
    
    if (!output) {
      // This will now cause the action to fail if the AI returns an empty response.
      throw new Error('AI model returned no output.');
    }
    
    return output;
  }
);
