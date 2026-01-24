// =============================================================================
// CHATBOT SERVICE TESTS
// Following CodeBakers pattern 08-testing.md
// =============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatbotService } from './chatbot-service';

// Mock the AI client
vi.mock('../lib/ai-client', () => ({
  getOpenAIClient: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'This is a test response from the chatbot.',
              },
            },
          ],
        }),
      },
    },
  })),
  isAIAvailable: vi.fn(() => true),
  AI_MODELS: {
    GPT35: 'gpt-3.5-turbo',
  },
}));

describe('ChatbotService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('chat', () => {
    it('should return a response when AI is available', async () => {
      const messages = [
        { role: 'user' as const, content: 'How do I search for opportunities?' },
      ];

      const response = await ChatbotService.chat(messages);

      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('conversationId');
      expect(typeof response.message).toBe('string');
      expect(response.message.length).toBeGreaterThan(0);
    });

    it('should handle conversation with multiple messages', async () => {
      const messages = [
        { role: 'user' as const, content: 'What is a NAICS code?' },
        { role: 'assistant' as const, content: 'NAICS codes are...' },
        { role: 'user' as const, content: 'How do I find mine?' },
      ];

      const response = await ChatbotService.chat(messages);

      expect(response).toHaveProperty('message');
      expect(response.message).toBeTruthy();
    });

    it('should preserve conversation ID if provided', async () => {
      const messages = [
        { role: 'user' as const, content: 'Test message' },
      ];
      const conversationId = 'conv_test_123';

      const response = await ChatbotService.chat(messages, conversationId);

      expect(response.conversationId).toBe(conversationId);
    });

    it('should generate a new conversation ID if not provided', async () => {
      const messages = [
        { role: 'user' as const, content: 'Test message' },
      ];

      const response = await ChatbotService.chat(messages);

      expect(response.conversationId).toBeTruthy();
      expect(response.conversationId).toMatch(/^conv_/);
    });
  });

  describe('chat - when AI unavailable', () => {
    it('should return fallback message when AI is not available', async () => {
      // Mock AI as unavailable
      const { isAIAvailable } = await import('../lib/ai-client');
      vi.mocked(isAIAvailable).mockReturnValue(false);

      const messages = [
        { role: 'user' as const, content: 'Test' },
      ];

      const response = await ChatbotService.chat(messages);

      expect(response.message).toContain('currently unavailable');
      expect(response.message).toContain('API key');
    });
  });

  describe('getSuggestedQuestions', () => {
    it('should return an array of suggested questions', () => {
      const suggestions = ChatbotService.getSuggestedQuestions();

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(typeof suggestions[0]).toBe('string');
    });

    it('should return questions related to the app', () => {
      const suggestions = ChatbotService.getSuggestedQuestions();

      // Check that at least one suggestion is about searching
      const hasSearchQuestion = suggestions.some((s) =>
        s.toLowerCase().includes('search')
      );
      expect(hasSearchQuestion).toBe(true);
    });
  });

  describe('isAvailable', () => {
    it('should return true when AI is available', async () => {
      const { isAIAvailable } = await import('../lib/ai-client');
      vi.mocked(isAIAvailable).mockReturnValue(true);

      const available = ChatbotService.isAvailable();

      expect(available).toBe(true);
    });

    it('should return false when AI is not available', async () => {
      const { isAIAvailable } = await import('../lib/ai-client');
      vi.mocked(isAIAvailable).mockReturnValue(false);

      const available = ChatbotService.isAvailable();

      expect(available).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle OpenAI API errors gracefully', async () => {
      // Mock AI as available but client throws error
      const { isAIAvailable, getOpenAIClient } = await import('../lib/ai-client');
      vi.mocked(isAIAvailable).mockReturnValue(true);
      vi.mocked(getOpenAIClient).mockImplementation(() => {
        throw new Error('API Error');
      });

      const messages = [
        { role: 'user' as const, content: 'Test' },
      ];

      await expect(ChatbotService.chat(messages)).rejects.toThrow();
    });
  });
});
