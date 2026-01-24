// =============================================================================
// OPPORTUNITIES ROUTES
// Following CodeBakers pattern 03-api.md + 02-auth.md
// Routes for discovered opportunities and "New Today"
// Protected with authentication middleware
// =============================================================================

import { Router, Request, Response } from 'express';
import { db } from '../db';
import { discoveredOpportunities, companyProfile } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { OpportunityMonitor } from '../services/opportunity-monitor';
import { AIScoringService } from '../services/ai-scoring-service';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// Standardized error response
function errorResponse(
  res: Response,
  message: string,
  code: string,
  status: number
) {
  return res.status(status).json({
    error: message,
    code,
  });
}

// GET /api/opportunities/new - Get opportunities marked as "new today"
router.get('/new', async (req: Request, res: Response) => {
  try {
    const naicsCode = req.query.naicsCode as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

    let query = db
      .select()
      .from(discoveredOpportunities)
      .where(eq(discoveredOpportunities.isNew, true))
      .orderBy(desc(discoveredOpportunities.discoveredAt))
      .limit(limit);

    if (naicsCode) {
      const results = await db
        .select()
        .from(discoveredOpportunities)
        .where(and(
          eq(discoveredOpportunities.isNew, true),
          eq(discoveredOpportunities.naicsCode, naicsCode)
        ))
        .orderBy(desc(discoveredOpportunities.discoveredAt))
        .limit(limit);

      return res.json({
        data: results,
        count: results.length,
        success: true,
      });
    }

    const results = await query;

    return res.json({
      data: results,
      count: results.length,
      success: true,
    });

  } catch (error) {
    console.error('Get new opportunities error:', error);

    if (error instanceof Error) {
      return errorResponse(
        res,
        error.message,
        'GET_NEW_OPPORTUNITIES_ERROR',
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

// GET /api/opportunities/discovered - Get all discovered opportunities
router.get('/discovered', async (req: Request, res: Response) => {
  try {
    const naicsCode = req.query.naicsCode as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

    let results;

    if (naicsCode) {
      results = await db
        .select()
        .from(discoveredOpportunities)
        .where(eq(discoveredOpportunities.naicsCode, naicsCode))
        .orderBy(desc(discoveredOpportunities.discoveredAt))
        .limit(limit);
    } else {
      results = await db
        .select()
        .from(discoveredOpportunities)
        .orderBy(desc(discoveredOpportunities.discoveredAt))
        .limit(limit);
    }

    return res.json({
      data: results,
      count: results.length,
      success: true,
    });

  } catch (error) {
    console.error('Get discovered opportunities error:', error);

    if (error instanceof Error) {
      return errorResponse(
        res,
        error.message,
        'GET_DISCOVERED_ERROR',
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

// POST /api/opportunities/poll - Manually trigger opportunity poll (for testing)
router.post('/poll', async (req: Request, res: Response) => {
  try {
    // Trigger manual poll
    await OpportunityMonitor.runOnce();

    return res.json({
      message: 'Opportunity poll triggered successfully',
      success: true,
    });

  } catch (error) {
    console.error('Manual poll error:', error);

    if (error instanceof Error) {
      return errorResponse(
        res,
        error.message,
        'POLL_ERROR',
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

// POST /api/opportunities/score - Score an opportunity using AI
router.post('/score', async (req: Request, res: Response) => {
  try {
    const opportunity = req.body.opportunity;

    if (!opportunity) {
      return errorResponse(
        res,
        'Opportunity data is required',
        'MISSING_OPPORTUNITY',
        400
      );
    }

    // Fetch company profile
    const profiles = await db.select().from(companyProfile).limit(1);
    const profile = profiles.length > 0 ? profiles[0] : null;

    // Score the opportunity
    const score = await AIScoringService.scoreOpportunity(opportunity, profile);

    return res.json({
      score,
      success: true,
    });

  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(
        res,
        error.message,
        'SCORE_ERROR',
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
