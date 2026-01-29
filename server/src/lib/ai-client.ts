// =============================================================================
// AI CLIENT SETUP
// Following CodeBakers pattern 14-ai.md
// Supports OpenAI and Anthropic
// =============================================================================

import OpenAI from 'openai';

// Lazy initialization to avoid errors in tests
let openaiClient: OpenAI | null = null;

/**
 * Get OpenAI client with optional user API key
 * @param userApiKey - Optional user's OpenAI API key (falls back to platform key)
 */
export function getOpenAIClient(userApiKey?: string): OpenAI {
  // If user provides their own key, create a new client for them
  if (userApiKey) {
    console.log('🔑 Using user-provided OpenAI API key');
    return new OpenAI({ apiKey: userApiKey });
  }

  // Otherwise use cached platform client
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    console.log('🔑 Using platform OpenAI API key');
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
