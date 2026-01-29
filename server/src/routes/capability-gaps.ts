// =============================================================================
// CAPABILITY GAPS ROUTES
// Following CodeBakers pattern 03-api.md
// =============================================================================

import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { capabilityGaps, proposals } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { CapabilityGapService } from '../services/capability-gap-service';

const router = Router();

// Validation schema
const analyzeSchema = z.object({
  proposalId: z.string().uuid(),
});

const updateGapSchema = z.object({
  currentCoverage: z.boolean().optional(),
  notes: z.string().optional(),
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

// POST /api/capability-gaps/analyze - Generate capability gap analysis
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
    const analysis = await CapabilityGapService.analyzeCapabilityGaps(req.user.id, proposalId);

    return res.json({
      data: analysis,
      success: true,
      message: 'Capability gap analysis completed',
    });

  } catch (error) {
    console.error('Capability gap analysis error:', error);
    return errorResponse(
      res,
      'Failed to analyze capability gaps',
      'ANALYSIS_ERROR',
      500
    );
  }
});

// GET /api/capability-gaps/:proposalId - Get capability gaps for a proposal
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

    // Get capability gaps
    const gaps = await CapabilityGapService.getCapabilityGaps(proposalId);

    return res.json({
      data: gaps,
      success: true,
    });

  } catch (error) {
    console.error('Get capability gaps error:', error);
    return errorResponse(
      res,
      'Failed to fetch capability gaps',
      'FETCH_ERROR',
      500
    );
  }
});

// PATCH /api/capability-gaps/:id - Update a capability gap
router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    const { id } = req.params;

    // Validate request body
    const result = updateGapSchema.safeParse(req.body);

    if (!result.success) {
      return errorResponse(
        res,
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        result.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const data = result.data;

    // Get gap to verify ownership
    const [gap] = await db
      .select()
      .from(capabilityGaps)
      .where(eq(capabilityGaps.id, id))
      .limit(1);

    if (!gap) {
      return errorResponse(res, 'Gap not found', 'NOT_FOUND', 404);
    }

    // Verify proposal ownership
    const [proposal] = await db
      .select()
      .from(proposals)
      .where(and(
        eq(proposals.id, gap.proposalId),
        eq(proposals.userId, req.user.id)
      ))
      .limit(1);

    if (!proposal) {
      return errorResponse(res, 'Unauthorized', 'UNAUTHORIZED', 403);
    }

    // Update gap
    const [updated] = await db
      .update(capabilityGaps)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(capabilityGaps.id, id))
      .returning();

    return res.json({
      data: updated,
      success: true,
    });

  } catch (error) {
    console.error('Update capability gap error:', error);
    return errorResponse(
      res,
      'Failed to update capability gap',
      'UPDATE_ERROR',
      500
    );
  }
});

// DELETE /api/capability-gaps/:id - Delete a capability gap
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    const { id } = req.params;

    // Get gap to verify ownership
    const [gap] = await db
      .select()
      .from(capabilityGaps)
      .where(eq(capabilityGaps.id, id))
      .limit(1);

    if (!gap) {
      return errorResponse(res, 'Gap not found', 'NOT_FOUND', 404);
    }

    // Verify proposal ownership
    const [proposal] = await db
      .select()
      .from(proposals)
      .where(and(
        eq(proposals.id, gap.proposalId),
        eq(proposals.userId, req.user.id)
      ))
      .limit(1);

    if (!proposal) {
      return errorResponse(res, 'Unauthorized', 'UNAUTHORIZED', 403);
    }

    // Delete gap
    const [deleted] = await db
      .delete(capabilityGaps)
      .where(eq(capabilityGaps.id, id))
      .returning();

    return res.json({
      data: deleted,
      success: true,
    });

  } catch (error) {
    console.error('Delete capability gap error:', error);
    return errorResponse(
      res,
      'Failed to delete capability gap',
      'DELETE_ERROR',
      500
    );
  }
});

export default router;
