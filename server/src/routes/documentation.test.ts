// =============================================================================
// DOCUMENTATION ROUTES TESTS
// Following CodeBakers pattern 08-testing.md
// =============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import documentationRoutes from './documentation';

// Mock the documentation service
vi.mock('../services/documentation-service', () => ({
  DocumentationService: {
    getCategories: vi.fn().mockReturnValue([
      {
        id: 'getting-started',
        name: 'Getting Started',
        description: 'Learn the basics',
        icon: '🚀',
      },
    ]),
    getArticlesByCategory: vi.fn().mockReturnValue([
      {
        id: 'quick-start',
        title: 'Quick Start Guide',
        category: 'getting-started',
        content: '# Quick Start...',
        keywords: ['setup', 'start'],
        order: 1,
      },
    ]),
    getArticle: vi.fn().mockReturnValue({
      id: 'quick-start',
      title: 'Quick Start Guide',
      category: 'getting-started',
      content: '# Quick Start Guide\n\nContent here...',
      keywords: ['setup', 'start'],
      order: 1,
    }),
    search: vi.fn().mockReturnValue([
      {
        id: 'quick-start',
        title: 'Quick Start Guide',
        category: 'getting-started',
        content: '# Quick Start...',
        keywords: ['setup', 'start'],
        order: 1,
      },
    ]),
    getAllArticles: vi.fn().mockReturnValue([
      {
        id: 'quick-start',
        title: 'Quick Start Guide',
        category: 'getting-started',
        content: '# Quick Start...',
        keywords: ['setup', 'start'],
        order: 1,
      },
    ]),
    getRelatedArticles: vi.fn().mockReturnValue([
      {
        id: 'naics-codes',
        title: 'Understanding NAICS Codes',
        category: 'getting-started',
        content: '# NAICS...',
        keywords: ['naics'],
        order: 2,
      },
    ]),
  },
}));

const app = express();
app.use(express.json());
app.use('/api/documentation', documentationRoutes);

describe('Documentation Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/documentation/categories', () => {
    it('should return all categories', async () => {
      const response = await request(app).get('/api/documentation/categories');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('categories');
      expect(Array.isArray(response.body.categories)).toBe(true);
      expect(response.body.categories.length).toBeGreaterThan(0);
    });

    it('should return categories with proper structure', async () => {
      const response = await request(app).get('/api/documentation/categories');

      const category = response.body.categories[0];
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('description');
      expect(category).toHaveProperty('icon');
    });
  });

  describe('GET /api/documentation/category/:categoryId', () => {
    it('should return articles for a category', async () => {
      const response = await request(app).get(
        '/api/documentation/category/getting-started'
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('articles');
      expect(response.body).toHaveProperty('categoryId');
      expect(response.body).toHaveProperty('count');
      expect(response.body.categoryId).toBe('getting-started');
    });

    it('should return empty array for nonexistent category', async () => {
      const { DocumentationService } = await import('../services/documentation-service');
      vi.mocked(DocumentationService.getArticlesByCategory).mockReturnValue([]);

      const response = await request(app).get(
        '/api/documentation/category/nonexistent'
      );

      expect(response.status).toBe(200);
      expect(response.body.articles).toEqual([]);
      expect(response.body.count).toBe(0);
    });
  });

  describe('GET /api/documentation/article/:articleId', () => {
    it('should return an article with related articles', async () => {
      const response = await request(app).get(
        '/api/documentation/article/quick-start'
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('article');
      expect(response.body).toHaveProperty('related');
      expect(response.body.article.id).toBe('quick-start');
    });

    it('should return 404 for nonexistent article', async () => {
      const { DocumentationService } = await import('../services/documentation-service');
      vi.mocked(DocumentationService.getArticle).mockReturnValue(null);

      const response = await request(app).get(
        '/api/documentation/article/nonexistent'
      );

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.code).toBe('ARTICLE_NOT_FOUND');
    });
  });

  describe('GET /api/documentation/search', () => {
    it('should search documentation and return results', async () => {
      const response = await request(app).get(
        '/api/documentation/search?q=quick+start'
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('results');
      expect(response.body).toHaveProperty('query');
      expect(response.body).toHaveProperty('count');
      expect(response.body.query).toBe('quick start');
    });

    it('should return 400 for missing query', async () => {
      const response = await request(app).get('/api/documentation/search');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty query', async () => {
      const response = await request(app).get('/api/documentation/search?q=');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should handle URL-encoded queries', async () => {
      const response = await request(app).get(
        '/api/documentation/search?q=how%20to%20search'
      );

      expect(response.status).toBe(200);
      expect(response.body.query).toBe('how to search');
    });
  });

  describe('GET /api/documentation/all', () => {
    it('should return all articles', async () => {
      const response = await request(app).get('/api/documentation/all');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('articles');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.articles)).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle service errors gracefully', async () => {
      const { DocumentationService } = await import('../services/documentation-service');
      vi.mocked(DocumentationService.getCategories).mockImplementation(() => {
        throw new Error('Service error');
      });

      const response = await request(app).get('/api/documentation/categories');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});
