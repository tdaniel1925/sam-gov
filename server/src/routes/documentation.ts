// =============================================================================
// DOCUMENTATION API ROUTES
// Following CodeBakers pattern 03-api.md
// Help and documentation endpoints
// =============================================================================

import { Router } from 'express';
import { z } from 'zod';
import { DocumentationService } from '../services/documentation-service';

const router = Router();

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
});

// =============================================================================
// ROUTES
// =============================================================================

/**
 * GET /api/documentation/categories
 * Get all documentation categories
 */
router.get('/categories', (req, res) => {
  try {
    const categories = DocumentationService.getCategories();
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Failed to get categories',
      code: 'CATEGORIES_ERROR',
    });
  }
});

/**
 * GET /api/documentation/category/:categoryId
 * Get all articles in a category
 */
router.get('/category/:categoryId', (req, res) => {
  try {
    const { categoryId } = req.params;
    const articles = DocumentationService.getArticlesByCategory(categoryId);

    res.json({
      categoryId,
      articles,
      count: articles.length,
    });
  } catch (error) {
    console.error('Get category articles error:', error);
    res.status(500).json({
      error: 'Failed to get category articles',
      code: 'CATEGORY_ARTICLES_ERROR',
    });
  }
});

/**
 * GET /api/documentation/article/:articleId
 * Get a specific article by ID
 */
router.get('/article/:articleId', (req, res): void => {
  try {
    const { articleId } = req.params;
    const article = DocumentationService.getArticle(articleId);

    if (!article) {
      return res.status(404).json({
        error: 'Article not found',
        code: 'ARTICLE_NOT_FOUND',
      });
    }

    // Get related articles
    const related = DocumentationService.getRelatedArticles(articleId);

    res.json({
      article,
      related,
    });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({
      error: 'Failed to get article',
      code: 'ARTICLE_ERROR',
    });
  }
});

/**
 * GET /api/documentation/search
 * Search documentation
 */
router.get('/search', (req, res): void => {
  try {
    const validation = searchQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: validation.error.errors,
      });
    }

    const { q } = validation.data;
    const results = DocumentationService.search(q);

    res.json({
      query: q,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('Search documentation error:', error);
    res.status(500).json({
      error: 'Failed to search documentation',
      code: 'SEARCH_ERROR',
    });
  }
});

/**
 * GET /api/documentation/all
 * Get all articles (for export/backup)
 */
router.get('/all', (req, res) => {
  try {
    const articles = DocumentationService.getAllArticles();
    res.json({
      articles,
      count: articles.length,
    });
  } catch (error) {
    console.error('Get all articles error:', error);
    res.status(500).json({
      error: 'Failed to get all articles',
      code: 'ALL_ARTICLES_ERROR',
    });
  }
});

export default router;
