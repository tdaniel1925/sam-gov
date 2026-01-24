// =============================================================================
// AI CLIENT SETUP
// Following CodeBakers pattern 14-ai.md
// Supports OpenAI and Anthropic
// =============================================================================

import OpenAI from 'openai';

// Lazy initialization to avoid errors in tests
let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// Model constants
export const AI_MODELS = {
  GPT4: 'gpt-4-turbo-preview',
  GPT4_MINI: 'gpt-4-0613',
  GPT35: 'gpt-3.5-turbo',
  EMBEDDING: 'text-embedding-3-small',
} as const;

// Check if AI is available
export function isAIAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}
