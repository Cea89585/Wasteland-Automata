// src/app/actions.ts
'use server';

import {
  generateFactionEncounter,
  type FactionEncounterInput,
  type FactionEncounterOutput,
} from '@/ai/flows/dynamic-faction-encounters';

export async function getFactionEncounter(
  input: FactionEncounterInput
): Promise<FactionEncounterOutput> {
  try {
    const encounter = await generateFactionEncounter(input);
    return encounter;
  } catch (error) {
    console.error('Error in getFactionEncounter action:', error);
    // Return a fallback encounter on error
    return {
      faction: 'Unknown',
      description: 'A chill runs down your spine as you scan the horizon, but you see nothing out of the ordinary. The feeling of being watched lingers.',
      outcome: {
        type: 'neutral'
      }
    };
  }
}
