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
  return await generateFactionEncounter(input);
}
