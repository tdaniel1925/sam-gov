// =============================================================================
// SEARCH ROUTES
// Following CodeBakers pattern 03-api.md
// =============================================================================

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { SAMGovService } from '../services/samgov-service';

const router = Router();

// Validation schema
const searchSchema = z.object({
  naicsCode: z.string().regex(/^\d{1,6}$/, 'NAICS code must be 1-6 digits').optional(),
  postedFrom: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Date must be in MM/DD/YYYY format'),
  postedTo: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Date must be in MM/DD/YYYY format'),
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),
});

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

// POST /api/search - Search opportunities
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const result = searchSchema.safeParse(req.body);

    if (!result.success) {
      return errorResponse(
        res,
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        result.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { naicsCode, postedFrom, postedTo, limit, offset } = result.data;

    // Call SAM.gov API
    const opportunities = await SAMGovService.searchOpportunities({
      ncode: naicsCode,
      postedFrom,
      postedTo,
      limit: limit || 20,
      offset: offset || 0,
    });

    return res.json({
      data: opportunities,
      success: true,
    });

  } catch (error) {
    console.error('Search error:', error);

    if (error instanceof Error) {
      return errorResponse(
        res,
        error.message,
        'SEARCH_ERROR',
        500
      );
    }

    return errorResponse(
      res,
      'Internal server error',
      'INTERNAL_ERROR',
      500
    );
  }
});

// GET /api/search/recent - Get recent opportunities
router.get('/recent', async (req: Request, res: Response) => {
  try {
    const naicsCode = req.query.naicsCode as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const opportunities = await SAMGovService.getRecentOpportunities(naicsCode, limit);

    return res.json({
      data: opportunities,
      success: true,
    });

  } catch (error) {
    console.error('Recent search error:', error);

    if (error instanceof Error) {
      return errorResponse(
        res,
        error.message,
        'SEARCH_ERROR',
        500
      );
    }

    return errorResponse(
      res,
      'Internal server error',
      'INTERNAL_ERROR',
      500
    );
  }
});

export default router;
