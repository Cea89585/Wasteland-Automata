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
    output: { schema: ValidateCharacterNameOutputSchema },
    model: 'googleai/gemini-1.5-flash-latest',
    prompt: `You are a content moderator for a family-friendly post-apocalyptic survival game.
Evaluate the following name for appropriateness. The name should not contain profanity, hate speech, or sexually explicit content.

Name: {{{name}}}

Based on this, is the name allowed?`,
    config: {
      // Use safety settings to automatically block harmful content
      safetySettings: [
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
      ],
      temperature: 0.1, // Low temperature for consistent moderation
    },
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
    const { output } = await validateNamePrompt(input);
    return output!;
  }
);
