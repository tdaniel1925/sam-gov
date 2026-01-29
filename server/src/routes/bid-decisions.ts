// =============================================================================
// BID DECISIONS ROUTES
// Following CodeBakers pattern 03-api.md
// =============================================================================

import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { bidDecisions, proposals } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { BidDecisionService } from '../services/bid-decision-service';

const router = Router();

// Validation schema
const analyzeSchema = z.object({
  proposalId: z.string().uuid(),
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

// POST /api/bid-decisions/analyze - Generate bid/no-bid analysis
router.post('/analyze', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    // Validate request body
    const result = analyzeSchema.safeParse(req.body);

    if (!result.success) {
      return errorResponse(
        res,
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        result.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { proposalId } = result.data;

    // Verify proposal ownership
    const [proposal] = await db
      .select()
      .from(proposals)
      .where(and(
        eq(proposals.id, proposalId),
        eq(proposals.userId, req.user.id)
      ))
      .limit(1);

    if (!proposal) {
      return errorResponse(
        res,
        'Proposal not found or unauthorized',
        'NOT_FOUND',
        404
      );
    }

    // Run analysis
    const analysis = await BidDecisionService.analyzeBidDecision(req.user.id, proposalId);

    return res.json({
      data: analysis,
      success: true,
      message: 'Bid decision analysis completed',
    });

  } catch (error) {
    console.error('Bid decision analysis error:', error);
    return errorResponse(
      res,
      'Failed to analyze bid decision',
      'ANALYSIS_ERROR',
      500
    );
  }
});

// GET /api/bid-decisions/:proposalId - Get bid decision for a proposal
router.get('/:proposalId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    const { proposalId } = req.params;

    // Verify proposal ownership
    const [proposal] = await db
      .select()
      .from(proposals)
      .where(and(
        eq(proposals.id, proposalId),
        eq(proposals.userId, req.user.id)
      ))
      .limit(1);

    if (!proposal) {
      return errorResponse(
        res,
        'Proposal not found or unauthorized',
        'NOT_FOUND',
        404
      );
    }

    // Get latest bid decision
    const [decision] = await db
      .select()
      .from(bidDecisions)
      .where(eq(bidDecisions.proposalId, proposalId))
      .orderBy(desc(bidDecisions.createdAt))
      .limit(1);

    if (!decision) {
      return errorResponse(
        res,
        'No bid decision found for this proposal',
        'NOT_FOUND',
        404
      );
    }

    return res.json({
      data: decision,
      success: true,
    });

  } catch (error) {
    console.error('Get bid decision error:', error);
    return errorResponse(
      res,
      'Failed to fetch bid decision',
      'FETCH_ERROR',
      500
    );
  }
});

// GET /api/bid-decisions/history/:proposalId - Get all bid decisions for a proposal
router.get('/history/:proposalId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    const { proposalId } = req.params;

    // Verify proposal ownership
    const [proposal] = await db
      .select()
      .from(proposals)
      .where(and(
        eq(proposals.id, proposalId),
        eq(proposals.userId, req.user.id)
      ))
      .limit(1);

    if (!proposal) {
      return errorResponse(
        res,
        'Proposal not found or unauthorized',
        'NOT_FOUND',
        404
      );
    }

    // Get all bid decisions
    const decisions = await db
      .select()
      .from(bidDecisions)
      .where(eq(bidDecisions.proposalId, proposalId))
      .orderBy(desc(bidDecisions.createdAt));

    return res.json({
      data: decisions,
      success: true,
    });

  } catch (error) {
    console.error('Get bid decision history error:', error);
    return errorResponse(
      res,
      'Failed to fetch bid decision history',
      'FETCH_ERROR',
      500
    );
  }
});

export default router;
