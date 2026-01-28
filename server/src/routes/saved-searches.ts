// =============================================================================
// SAVED SEARCHES ROUTES
// Following CodeBakers pattern 03-api.md
// Save and manage search configurations with alerts
// =============================================================================

import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { savedSearches } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { SAMGovService } from '../services/samgov-service';

const router = Router();

// Apply auth middleware
router.use(requireAuth);

// Validation schemas
const savedSearchSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  searchParams: z.object({
    naicsCode: z.string().optional(),
    procurementType: z.string().optional(),
    state: z.string().optional(),
    setAside: z.string().optional(),
    keywords: z.string().optional(),
    classificationCode: z.string().optional(),
    organizationName: z.string().optional(),
  }).passthrough(), // Allow additional params
  alertEnabled: z.boolean().optional(),
  alertFrequency: z.enum(['daily', 'weekly', 'realtime', 'off']).optional(),
});

const updateSavedSearchSchema = savedSearchSchema.partial();

// Standardized error response
function errorResponse(
  res: Response,
  message: string,
  code: string,
  status: number,
  details?: Record<string, string[]>
) {
  return res.status(status).json({
    error: message,
    code,
    details,
  });
}

// GET /api/saved-searches - Get all saved searches for user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    const searches = await db
      .select()
      .from(savedSearches)
      .where(eq(savedSearches.userId, userId))
      .orderBy(desc(savedSearches.createdAt));

    return res.json({
      data: searches,
      success: true,
    });

  } catch (error) {
    console.error('Get saved searches error:', error);

    if (error instanceof Error) {
      return errorResponse(res, error.message, 'GET_SAVED_SEARCHES_ERROR', 500);
    }

    return errorResponse(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

// POST /api/saved-searches - Create new saved search
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    const result = savedSearchSchema.safeParse(req.body);

    if (!result.success) {
      return errorResponse(
        res,
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        result.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { name, description, searchParams, alertEnabled, alertFrequency } = result.data;

    const [newSearch] = await db.insert(savedSearches).values({
      userId,
      name,
      description,
      searchParams,
      alertEnabled: alertEnabled || false,
      alertFrequency: alertFrequency || 'daily',
    }).returning();

    return res.status(201).json({
      data: newSearch,
      success: true,
    });

  } catch (error) {
    console.error('Create saved search error:', error);

    if (error instanceof Error) {
      return errorResponse(res, error.message, 'CREATE_SAVED_SEARCH_ERROR', 500);
    }

    return errorResponse(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

// POST /api/saved-searches/:id/run - Execute a saved search
router.post('/:id/run', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const searchId = req.params.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    // Get saved search
    const [search] = await db
      .select()
      .from(savedSearches)
      .where(and(
        eq(savedSearches.id, searchId),
        eq(savedSearches.userId, userId)
      ))
      .limit(1);

    if (!search) {
      return errorResponse(res, 'Saved search not found', 'NOT_FOUND', 404);
    }

    // Build date range (default: last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const formatDate = (date: Date): string => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };

    // Execute search
    const results = await SAMGovService.searchOpportunities({
      ...search.searchParams,
      postedFrom: formatDate(thirtyDaysAgo),
      postedTo: formatDate(today),
      limit: 100,
    });

    // Update last run and result count
    await db
      .update(savedSearches)
      .set({
        lastRun: new Date(),
        resultCount: results.totalRecords,
      })
      .where(eq(savedSearches.id, searchId));

    return res.json({
      data: results,
      search: {
        id: search.id,
        name: search.name,
      },
      success: true,
    });

  } catch (error) {
    console.error('Run saved search error:', error);

    if (error instanceof Error) {
      return errorResponse(res, error.message, 'RUN_SAVED_SEARCH_ERROR', 500);
    }

    return errorResponse(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

// PATCH /api/saved-searches/:id - Update saved search
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const searchId = req.params.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    const result = updateSavedSearchSchema.safeParse(req.body);

    if (!result.success) {
      return errorResponse(
        res,
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        result.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const updateData = {
      ...result.data,
      updatedAt: new Date(),
    };

    const [updatedSearch] = await db
      .update(savedSearches)
      .set(updateData)
      .where(and(
        eq(savedSearches.id, searchId),
        eq(savedSearches.userId, userId)
      ))
      .returning();

    if (!updatedSearch) {
      return errorResponse(res, 'Saved search not found', 'NOT_FOUND', 404);
    }

    return res.json({
      data: updatedSearch,
      success: true,
    });

  } catch (error) {
    console.error('Update saved search error:', error);

    if (error instanceof Error) {
      return errorResponse(res, error.message, 'UPDATE_SAVED_SEARCH_ERROR', 500);
    }

    return errorResponse(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

// DELETE /api/saved-searches/:id - Delete saved search
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const searchId = req.params.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    const [deletedSearch] = await db
      .delete(savedSearches)
      .where(and(
        eq(savedSearches.id, searchId),
        eq(savedSearches.userId, userId)
      ))
      .returning();

    if (!deletedSearch) {
      return errorResponse(res, 'Saved search not found', 'NOT_FOUND', 404);
    }

    return res.json({
      message: 'Saved search deleted successfully',
      success: true,
    });

  } catch (error) {
    console.error('Delete saved search error:', error);

    if (error instanceof Error) {
      return errorResponse(res, error.message, 'DELETE_SAVED_SEARCH_ERROR', 500);
    }

    return errorResponse(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

export default router;
