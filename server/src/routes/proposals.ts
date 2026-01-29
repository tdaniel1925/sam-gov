// =============================================================================
// PROPOSALS ROUTES
// Following CodeBakers pattern 03-api.md
// =============================================================================

import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { proposals, proposalSections, proposalRequirements } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Validation schemas
const createProposalSchema = z.object({
  opportunityId: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  solicitationNumber: z.string().optional(),
  agencyName: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedValue: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

const updateProposalSchema = z.object({
  title: z.string().min(1).optional(),
  solicitationNumber: z.string().optional(),
  agencyName: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(['draft', 'in_progress', 'under_review', 'submitted', 'won', 'lost', 'withdrawn']).optional(),
  winProbability: z.number().min(0).max(100).optional(),
  estimatedValue: z.number().optional(),
  bidDecision: z.enum(['bid', 'no_bid', 'maybe', 'undecided']).optional(),
  bidDecisionReasoning: z.string().optional(),
  metadata: z.record(z.any()).optional(),
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

// GET /api/proposals - Get all proposals for the authenticated user
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    const userProposals = await db
      .select()
      .from(proposals)
      .where(eq(proposals.userId, req.user.id))
      .orderBy(desc(proposals.createdAt));

    return res.json({
      data: userProposals,
      success: true,
    });

  } catch (error) {
    console.error('Get proposals error:', error);
    return errorResponse(
      res,
      'Failed to fetch proposals',
      'FETCH_ERROR',
      500
    );
  }
});

// GET /api/proposals/:id - Get a single proposal with sections and requirements
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    const { id } = req.params;

    // Get proposal
    const [proposal] = await db
      .select()
      .from(proposals)
      .where(and(
        eq(proposals.id, id),
        eq(proposals.userId, req.user.id)
      ))
      .limit(1);

    if (!proposal) {
      return errorResponse(
        res,
        'Proposal not found',
        'NOT_FOUND',
        404
      );
    }

    // Get sections
    const sections = await db
      .select()
      .from(proposalSections)
      .where(eq(proposalSections.proposalId, id))
      .orderBy(proposalSections.order);

    // Get requirements
    const requirements = await db
      .select()
      .from(proposalRequirements)
      .where(eq(proposalRequirements.proposalId, id));

    return res.json({
      data: {
        ...proposal,
        sections,
        requirements,
      },
      success: true,
    });

  } catch (error) {
    console.error('Get proposal error:', error);
    return errorResponse(
      res,
      'Failed to fetch proposal',
      'FETCH_ERROR',
      500
    );
  }
});

// POST /api/proposals - Create a new proposal
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    // Validate request body
    const result = createProposalSchema.safeParse(req.body);

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

    // Create proposal
    const [newProposal] = await db
      .insert(proposals)
      .values({
        userId: req.user.id,
        opportunityId: data.opportunityId,
        title: data.title,
        solicitationNumber: data.solicitationNumber,
        agencyName: data.agencyName,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        estimatedValue: data.estimatedValue?.toString(),
        metadata: data.metadata,
        status: 'draft',
      })
      .returning();

    return res.status(201).json({
      data: newProposal,
      success: true,
    });

  } catch (error) {
    console.error('Create proposal error:', error);
    return errorResponse(
      res,
      'Failed to create proposal',
      'CREATE_ERROR',
      500
    );
  }
});

// PATCH /api/proposals/:id - Update a proposal
router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    const { id } = req.params;

    // Validate request body
    const result = updateProposalSchema.safeParse(req.body);

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

    // Update proposal (only if user owns it)
    const [updated] = await db
      .update(proposals)
      .set({
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        estimatedValue: data.estimatedValue?.toString(),
        updatedAt: new Date(),
      })
      .where(and(
        eq(proposals.id, id),
        eq(proposals.userId, req.user.id)
      ))
      .returning();

    if (!updated) {
      return errorResponse(
        res,
        'Proposal not found or unauthorized',
        'NOT_FOUND',
        404
      );
    }

    return res.json({
      data: updated,
      success: true,
    });

  } catch (error) {
    console.error('Update proposal error:', error);
    return errorResponse(
      res,
      'Failed to update proposal',
      'UPDATE_ERROR',
      500
    );
  }
});

// DELETE /api/proposals/:id - Delete a proposal
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    const { id } = req.params;

    // Delete proposal (cascade will delete sections and requirements)
    const [deleted] = await db
      .delete(proposals)
      .where(and(
        eq(proposals.id, id),
        eq(proposals.userId, req.user.id)
      ))
      .returning();

    if (!deleted) {
      return errorResponse(
        res,
        'Proposal not found or unauthorized',
        'NOT_FOUND',
        404
      );
    }

    return res.json({
      data: deleted,
      success: true,
    });

  } catch (error) {
    console.error('Delete proposal error:', error);
    return errorResponse(
      res,
      'Failed to delete proposal',
      'DELETE_ERROR',
      500
    );
  }
});

export default router;
