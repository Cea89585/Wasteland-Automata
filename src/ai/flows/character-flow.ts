
// src/ai/flows/character-flow.ts
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { gemini15Flash } from 'genkit/models';

// Input and Output Schemas
const GenerateNameOutputSchema = z.string();
const ValidateNameInputSchema = z.string();
const ValidateNameOutputSchema = z.object({
    isValid: z.boolean().describe('Whether the name is valid and appropriate.'),
    reason: z.string().describe('The reason why the name is not valid. Provide this only if the name is not valid.'),
});

// Type Exports
export type GenerateNameOutput = z.infer<typeof GenerateNameOutputSchema>;
export type ValidateNameInput = z.infer<typeof ValidateNameInputSchema>;
export type ValidateNameOutput = z.infer<typeof ValidateNameOutputSchema>;

// Exported Functions
export async function generateCharacterName(): Promise<GenerateNameOutput> {
    return generateNameFlow();
}

export async function validateCharacterName(name: ValidateNameInput): Promise<ValidateNameOutput> {
    return validateNameFlow(name);
}


// Prompts
const generateNamePrompt = ai.definePrompt({
    name: 'generateNamePrompt',
    model: gemini15Flash,
    output: { schema: GenerateNameOutputSchema },
    prompt: `Generate a single, cool, and thematic name for a survivor in a post-apocalyptic world. The name should be family-friendly and gender-neutral. Examples: Jax, River, Echo, Rook.`,
});

const validateNamePrompt = ai.definePrompt({
    name: 'validateNamePrompt',
    model: gemini15Flash,
    input: { schema: ValidateNameInputSchema },
    output: { schema: ValidateNameOutputSchema },
    prompt: `Analyze the following name to determine if it is appropriate for a family-friendly game. The name should not contain any profanity, offensive language, hate speech, or sexually explicit content. The name must be between 3 and 15 characters.

    Name: {{{input}}}
    
    If the name is valid, set isValid to true.
    If the name is not valid, set isValid to false and provide a brief, user-friendly reason.`,
});


// Flows
const generateNameFlow = ai.defineFlow(
  {
    name: 'generateNameFlow',
    outputSchema: GenerateNameOutputSchema,
  },
  async () => {
    const { output } = await generateNamePrompt();
    return output!;
  }
);

const validateNameFlow = ai.defineFlow(
  {
    name: 'validateNameFlow',
    inputSchema: ValidateNameInputSchema,
    outputSchema: ValidateNameOutputSchema,
  },
  async (name) => {
    const { output } = await validateNamePrompt(name);
    return output!;
  }
);
