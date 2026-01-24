// =============================================================================
// CHATBOT API ROUTES
// Following CodeBakers pattern 03-api.md
// Chat endpoints with streaming support
// =============================================================================

import { Router } from 'express';
import { z } from 'zod';
import { ChatbotService, type ChatMessage } from '../services/chatbot-service';

const router = Router();

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().min(1, 'Message content is required'),
    })
  ).min(1, 'At least one message is required'),
  conversationId: z.string().optional(),
});

// =============================================================================
// ROUTES
// =============================================================================

/**
 * POST /api/chat
 * Send a chat message and get AI response
 */
router.post('/', async (req, res): Promise<void> => {
  try {
    // Validate request body
    const validation = chatRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: validation.error.errors,
      });
    }

    const { messages, conversationId } = validation.data;

    // Get chatbot response
    const response = await ChatbotService.chat(messages as ChatMessage[], conversationId);

    res.json({
      message: response.message,
      conversationId: response.conversationId,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      code: 'CHAT_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/chat/stream
 * Stream chat response in real-time
 */
router.post('/stream', async (req, res): Promise<void> => {
  try {
    // Validate request body
    const validation = chatRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: validation.error.errors,
      });
    }

    const { messages } = validation.data;

    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Stream the response
    const stream = await ChatbotService.streamChat(messages as ChatMessage[]);

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    // Send done signal
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Chat stream error:', error);

    // If headers not sent, send error response
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to stream chat response',
        code: 'CHAT_STREAM_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } else {
      // If streaming already started, send error in stream
      res.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
      res.end();
    }
  }
});

/**
 * GET /api/chat/suggestions
 * Get suggested questions for users
 */
router.get('/suggestions', (req, res) => {
  try {
    const suggestions = ChatbotService.getSuggestedQuestions();
    res.json({ suggestions });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      error: 'Failed to get suggestions',
      code: 'SUGGESTIONS_ERROR',
    });
  }
});

/**
 * GET /api/chat/status
 * Check if chatbot is available
 */
router.get('/status', (req, res) => {
  try {
    const available = ChatbotService.isAvailable();
    res.json({
      available,
      message: available
        ? 'Chatbot is ready'
        : 'Chatbot is unavailable (OpenAI API key not configured)',
    });
  } catch (error) {
    console.error('Chatbot status error:', error);
    res.status(500).json({
      error: 'Failed to check chatbot status',
      code: 'STATUS_ERROR',
    });
  }
});

export default router;
