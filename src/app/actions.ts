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
  // The error handling is now done within the flow itself
  // to provide a more robust fallback.
  return await generateFactionEncounter(input);
}
