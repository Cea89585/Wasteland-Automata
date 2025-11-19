// src/ai/genkit.ts

import {genkit, Plugin} from 'genkit';
import {googleAI, GoogleAIVertexPredictResponse} from '@genkit-ai/google-genai';

let googleAiPlugin: Plugin<[any] | []> | undefined;

if (process.env.GEMINI_API_KEY) {
  googleAiPlugin = googleAI();
}

const plugins: Plugin<any>[] = googleAiPlugin ? [googleAiPlugin] : [];

export const ai = genkit({
  plugins,
  enableTracing: true,
  traceStore: 'dev-local'
});
