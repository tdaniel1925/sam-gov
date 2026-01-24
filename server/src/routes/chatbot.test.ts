// =============================================================================
// CHATBOT ROUTES TESTS
// Following CodeBakers pattern 08-testing.md
// =============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import chatbotRoutes from './chatbot';

// Mock the chatbot service
vi.mock('../services/chatbot-service', () => ({
  ChatbotService: {
    chat: vi.fn().mockResolvedValue({
      message: 'This is a test response.',
      conversationId: 'conv_test_123',
    }),
    streamChat: vi.fn().mockResolvedValue({
      async *[Symbol.asyncIterator]() {
        yield 'Test ';
        yield 'streaming ';
        yield 'response';
      },
    }),
    getSuggestedQuestions: vi.fn().mockReturnValue([
      'How do I search?',
      'What is a NAICS code?',
    ]),
    isAvailable: vi.fn().mockReturnValue(true),
  },
}));

const app = express();
app.use(express.json());
app.use('/api/chat', chatbotRoutes);

describe('Chatbot Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/chat', () => {
    it('should return a chat response', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({
          messages: [
            { role: 'user', content: 'How do I search for opportunities?' },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('conversationId');
      expect(typeof response.body.message).toBe('string');
    });

    it('should accept conversation ID', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({
          messages: [{ role: 'user', content: 'Test' }],
          conversationId: 'conv_existing_123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('conversationId');
    });

    it('should return 400 for empty messages array', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({
          messages: [],
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing messages', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid message role', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({
          messages: [{ role: 'invalid', content: 'Test' }],
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty message content', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({
          messages: [{ role: 'user', content: '' }],
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should handle multiple messages in conversation', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({
          messages: [
            { role: 'user', content: 'First question' },
            { role: 'assistant', content: 'First answer' },
            { role: 'user', content: 'Second question' },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/chat/stream', () => {
    it('should stream chat response', async () => {
      const response = await request(app)
        .post('/api/chat/stream')
        .send({
          messages: [{ role: 'user', content: 'Test streaming' }],
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/event-stream');
      expect(response.text).toContain('data:');
    });

    it('should return 400 for invalid streaming request', async () => {
      const response = await request(app)
        .post('/api/chat/stream')
        .send({
          messages: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/chat/suggestions', () => {
    it('should return suggested questions', async () => {
      const response = await request(app).get('/api/chat/suggestions');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('suggestions');
      expect(Array.isArray(response.body.suggestions)).toBe(true);
      expect(response.body.suggestions.length).toBeGreaterThan(0);
    });

    it('should return strings as suggestions', async () => {
      const response = await request(app).get('/api/chat/suggestions');

      expect(response.status).toBe(200);
      expect(typeof response.body.suggestions[0]).toBe('string');
    });
  });

  describe('GET /api/chat/status', () => {
    it('should return chatbot status', async () => {
      const response = await request(app).get('/api/chat/status');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('available');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.available).toBe('boolean');
    });

    it('should indicate when chatbot is available', async () => {
      const response = await request(app).get('/api/chat/status');

      expect(response.status).toBe(200);
      expect(response.body.available).toBe(true);
      expect(response.body.message).toContain('ready');
    });
  });

  describe('error handling', () => {
    it('should handle service errors gracefully', async () => {
      const { ChatbotService } = await import('../services/chatbot-service');
      vi.mocked(ChatbotService.chat).mockRejectedValueOnce(
        new Error('Service error')
      );

      const response = await request(app)
        .post('/api/chat')
        .send({
          messages: [{ role: 'user', content: 'Test' }],
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.code).toBe('CHAT_ERROR');
    });
  });
});
