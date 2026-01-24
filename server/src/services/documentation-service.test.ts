// =============================================================================
// DOCUMENTATION SERVICE TESTS
// Following CodeBakers pattern 08-testing.md
// =============================================================================

import { describe, it, expect } from 'vitest';
import { DocumentationService } from './documentation-service';

describe('DocumentationService', () => {
  describe('getCategories', () => {
    it('should return an array of categories', () => {
      const categories = DocumentationService.getCategories();

      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    it('should return categories with required properties', () => {
      const categories = DocumentationService.getCategories();
      const category = categories[0];

      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('description');
      expect(category).toHaveProperty('icon');
      expect(typeof category.id).toBe('string');
      expect(typeof category.name).toBe('string');
    });
  });

  describe('getArticlesByCategory', () => {
    it('should return articles for a valid category', () => {
      const articles = DocumentationService.getArticlesByCategory('getting-started');

      expect(Array.isArray(articles)).toBe(true);
      expect(articles.length).toBeGreaterThan(0);
    });

    it('should return empty array for invalid category', () => {
      const articles = DocumentationService.getArticlesByCategory('nonexistent');

      expect(Array.isArray(articles)).toBe(true);
      expect(articles.length).toBe(0);
    });

    it('should return articles sorted by order', () => {
      const articles = DocumentationService.getArticlesByCategory('getting-started');

      for (let i = 1; i < articles.length; i++) {
        expect(articles[i].order).toBeGreaterThanOrEqual(articles[i - 1].order);
      }
    });

    it('should return articles with required properties', () => {
      const articles = DocumentationService.getArticlesByCategory('getting-started');
      const article = articles[0];

      expect(article).toHaveProperty('id');
      expect(article).toHaveProperty('title');
      expect(article).toHaveProperty('category');
      expect(article).toHaveProperty('content');
      expect(article).toHaveProperty('keywords');
      expect(article).toHaveProperty('order');
      expect(Array.isArray(article.keywords)).toBe(true);
    });
  });

  describe('getArticle', () => {
    it('should return an article by ID', () => {
      const article = DocumentationService.getArticle('quick-start');

      expect(article).not.toBeNull();
      expect(article?.id).toBe('quick-start');
      expect(article?.title).toBeTruthy();
    });

    it('should return null for nonexistent article', () => {
      const article = DocumentationService.getArticle('nonexistent-id');

      expect(article).toBeNull();
    });

    it('should return article with full content', () => {
      const article = DocumentationService.getArticle('quick-start');

      expect(article).not.toBeNull();
      expect(article?.content.length).toBeGreaterThan(100);
    });
  });

  describe('search', () => {
    it('should find articles by title match', () => {
      const results = DocumentationService.search('quick start');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title.toLowerCase()).toContain('quick');
    });

    it('should find articles by keyword match', () => {
      const results = DocumentationService.search('naics');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find articles by content match', () => {
      const results = DocumentationService.search('opportunities');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', () => {
      const results = DocumentationService.search('xyzabc123nonexistent');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should return empty array for empty query', () => {
      const results = DocumentationService.search('');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should be case insensitive', () => {
      const results1 = DocumentationService.search('NAICS');
      const results2 = DocumentationService.search('naics');

      expect(results1.length).toBeGreaterThan(0);
      expect(results1.length).toBe(results2.length);
    });

    it('should limit results to 10', () => {
      const results = DocumentationService.search('the');

      expect(results.length).toBeLessThanOrEqual(10);
    });

    it('should rank title matches higher', () => {
      const results = DocumentationService.search('naics');

      // The first result should have 'naics' in the title
      const firstResult = results[0];
      expect(
        firstResult.title.toLowerCase().includes('naics') ||
        firstResult.keywords.includes('naics')
      ).toBe(true);
    });
  });

  describe('getAllArticles', () => {
    it('should return all articles', () => {
      const articles = DocumentationService.getAllArticles();

      expect(Array.isArray(articles)).toBe(true);
      expect(articles.length).toBeGreaterThan(0);
    });

    it('should return articles from all categories', () => {
      const articles = DocumentationService.getAllArticles();
      const categories = new Set(articles.map((a) => a.category));

      expect(categories.size).toBeGreaterThan(1);
    });
  });

  describe('getRelatedArticles', () => {
    it('should return related articles from same category', () => {
      const related = DocumentationService.getRelatedArticles('quick-start');

      expect(Array.isArray(related)).toBe(true);
      if (related.length > 0) {
        expect(related[0].category).toBe('getting-started');
      }
    });

    it('should not include the source article', () => {
      const related = DocumentationService.getRelatedArticles('quick-start');

      const includesSource = related.some((a) => a.id === 'quick-start');
      expect(includesSource).toBe(false);
    });

    it('should limit results to specified amount', () => {
      const related = DocumentationService.getRelatedArticles('quick-start', 2);

      expect(related.length).toBeLessThanOrEqual(2);
    });

    it('should return empty array for nonexistent article', () => {
      const related = DocumentationService.getRelatedArticles('nonexistent');

      expect(Array.isArray(related)).toBe(true);
      expect(related.length).toBe(0);
    });
  });
});
