
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
  outcome: z.object({
    type: z.enum(['positive', 'negative', 'neutral']).describe("The type of outcome for the player: 'positive', 'negative', or 'neutral'."),
    reward: z.object({
        item: z.enum(['components', 'banana', 'peach', 'water']).describe("The item rewarded to the player, if any."),
        quantity: z.number().describe("The quantity of the item rewarded."),
      }).optional().describe("The reward for a positive outcome. Should be included only if the outcome type is 'positive'."),
    penalty: z.object({
        stat: z.enum(['health', 'hunger', 'thirst']).describe("The player stat that is penalized, if any."),
        amount: z.number().describe("The percentage to reduce the stat by (e.g., 15 for 15%)."),
      }).optional().describe("The penalty for a negative outcome. Should be included only if the outcome type is 'negative'."),
  }).describe("The result of the encounter for the player."),
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

  Generate a short description of an encounter with one of these factions. Include which faction was encountered.
  
  The encounter should have a roughly 50/50 chance of being 'positive' or 'negative' for the player.
  - If the outcome is 'positive', the player should receive a small reward. Choose one of the following rewards: 1-3 components, 1-3 bananas, or 1-3 peaches. The description should reflect how the player obtained this reward. Set the 'outcome.type' to 'positive' and fill in the 'outcome.reward' object.
  - If the outcome is 'negative', the player should suffer a penalty. Choose one of the following stats to penalize: health, hunger, or thirst. The penalty should be a 15% reduction. The description should reflect why this penalty occurred. Set the 'outcome.type' to 'negative' and fill in the 'outcome.penalty' object.
  - If for some reason neither fits, make it 'neutral'. In this case, do not include 'reward' or 'penalty' objects.
  
  The description must narrate the scene, the faction's demeanor, the action that leads to the outcome, and the immediate result for the player.
  Do not offer choices to the player or suggest any follow-up actions. Just describe the scene and its direct result.
  
  Always return a valid JSON object adhering to the output schema. The 'outcome' field must always be an object containing a 'type'.
`,
});

const factionEncounterFlow = ai.defineFlow(
  {
    name: 'factionEncounterFlow',
    inputSchema: FactionEncounterInputSchema,
    outputSchema: FactionEncounterOutputSchema,
  },
  async input => {
    try {
      const {output} = await factionEncounterPrompt(input);
      // Validate that the output exists and seems plausible
      if (output && output.faction && output.description && output.outcome) {
        // Further check for consistency
        if (output.outcome.type === 'positive' && !output.outcome.reward) {
           // AI said it was positive but didn't provide a reward. Let's call it neutral.
           output.outcome.type = 'neutral';
        }
        if (output.outcome.type === 'negative' && !output.outcome.penalty) {
           // AI said it was negative but didn't provide a penalty. Let's call it neutral.
           output.outcome.type = 'neutral';
        }
        return output;
      }
      // If we reach here, the output is invalid.
      throw new Error('AI failed to generate a valid or complete encounter.');
    } catch(e) {
       console.error("Error in factionEncounterFlow, returning a fallback neutral encounter:", e);
       // Return a structured, neutral fallback encounter on any error
       return {
          faction: 'Unknown',
          description: 'A chill runs down your spine as you scan the horizon, but you see nothing out of the ordinary. The feeling of being watched lingers.',
          outcome: {
            type: 'neutral'
          }
        };
    }
  }
);
