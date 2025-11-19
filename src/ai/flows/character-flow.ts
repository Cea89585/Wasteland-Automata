// src/ai/flows/character-flow.ts
'use server';
/**
 * @fileOverview A character AI flow for validating names.
 *
 * - validateCharacterName - A function that checks if a name is appropriate.
 * - ValidateCharacterNameInput - The input type for the validation function.
 * - ValidateCharacterNameOutput - The return type for the validation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input and Output Schemas
const ValidateCharacterNameInputSchema = z.object({
  name: z.string().describe('The name to validate.'),
});
export type ValidateCharacterNameInput = z.infer<
  typeof ValidateCharacterNameInputSchema
>;

const ValidateCharacterNameOutputSchema = z.object({
  isAllowed: z
    .boolean()
    .describe('Whether the name is appropriate for a general audience.'),
});
export type ValidateCharacterNameOutput = z.infer<
  typeof ValidateCharacterNameOutputSchema
>;

// Main exported validation function
export async function validateCharacterName(
  input: ValidateCharacterNameInput
): Promise<ValidateCharacterNameOutput> {
  return validateNameFlow(input);
}

// Prompt definition for validation
const validateNamePrompt = ai.definePrompt(
  {
    name: 'validateNamePrompt',
    input: { schema: ValidateCharacterNameInputSchema },
    prompt: `You are a content moderator for a family-friendly post-apocalyptic survival game.
Evaluate the following name for appropriateness. The name should not contain profanity, hate speech, or sexually explicit content.

Name: {{{name}}}

Respond with ONLY a valid JSON object in the following format: {"isAllowed": boolean}`,
    model: 'googleai/gemini-1.5-flash-latest',
    // Removed config and output to avoid sending responseMimeType
  }
);

// Flow definition for validation
const validateNameFlow = ai.defineFlow(
  {
    name: 'validateNameFlow',
    inputSchema: ValidateCharacterNameInputSchema,
    outputSchema: ValidateCharacterNameOutputSchema,
  },
  async (input) => {
    const result = await validateNamePrompt(input);
    const jsonText = result.text.trim().replace(/```json/g, '').replace(/```/g, '');
    try {
        const output = JSON.parse(jsonText);
        return ValidateCharacterNameOutputSchema.parse(output);
    } catch(e) {
        console.error("Failed to parse JSON from model output:", jsonText);
        // Fallback to a safe default if parsing fails
        return { isAllowed: false };
    }
  }
);
