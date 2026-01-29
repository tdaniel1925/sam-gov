// =============================================================================
// PROPOSAL SECTIONS ROUTES
// Following CodeBakers pattern 03-api.md
// =============================================================================

import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { proposalSections, proposals } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Validation schemas
const createSectionSchema = z.object({
  proposalId: z.string().uuid(),
  sectionType: z.enum([
    'executive_summary',
    'technical_approach',
    'management_plan',
    'staffing_plan',
    'past_performance',
    'cost_proposal',
    'boe_narrative',
    'custom'
  ]),
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  order: z.number().int().min(0).optional(),
  pageLimit: z.number().int().positive().optional(),
});

const updateSectionSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  order: z.number().int().min(0).optional(),
  pageLimit: z.number().int().positive().optional(),
  wordCount: z.number().int().min(0).optional(),
  aiGenerated: z.boolean().optional(),
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

// Middleware to verify proposal ownership
async function verifyProposalOwnership(
  proposalId: string,
  userId: string
): Promise<boolean> {
  const [proposal] = await db
    .select()
    .from(proposals)
    .where(and(
      eq(proposals.id, proposalId),
      eq(proposals.userId, userId)
    ))
    .limit(1);

  return !!proposal;
}

// GET /api/proposal-sections/:proposalId - Get all sections for a proposal
router.get('/:proposalId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    const { proposalId } = req.params;

    // Verify ownership
    const isOwner = await verifyProposalOwnership(proposalId, req.user.id);
    if (!isOwner) {
      return errorResponse(res, 'Proposal not found or unauthorized', 'NOT_FOUND', 404);
    }

    const sections = await db
      .select()
      .from(proposalSections)
      .where(eq(proposalSections.proposalId, proposalId))
      .orderBy(proposalSections.order);

    return res.json({
      data: sections,
      success: true,
    });

  } catch (error) {
    console.error('Get sections error:', error);
    return errorResponse(
      res,
      'Failed to fetch sections',
      'FETCH_ERROR',
      500
    );
  }
});

// POST /api/proposal-sections - Create a new section
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    // Validate request body
    const result = createSectionSchema.safeParse(req.body);

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

    // Verify ownership
    const isOwner = await verifyProposalOwnership(data.proposalId, req.user.id);
    if (!isOwner) {
      return errorResponse(res, 'Proposal not found or unauthorized', 'NOT_FOUND', 404);
    }

    // Create section
    const [newSection] = await db
      .insert(proposalSections)
      .values({
        proposalId: data.proposalId,
        sectionType: data.sectionType,
        title: data.title,
        content: data.content || '',
        order: data.order || 0,
        pageLimit: data.pageLimit,
        wordCount: 0,
        aiGenerated: false,
      })
      .returning();

    return res.status(201).json({
      data: newSection,
      success: true,
    });

  } catch (error) {
    console.error('Create section error:', error);
    return errorResponse(
      res,
      'Failed to create section',
      'CREATE_ERROR',
      500
    );
  }
});

// PATCH /api/proposal-sections/:id - Update a section
router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    const { id } = req.params;

    // Validate request body
    const result = updateSectionSchema.safeParse(req.body);

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

    // Get section to verify ownership through proposal
    const [section] = await db
      .select()
      .from(proposalSections)
      .where(eq(proposalSections.id, id))
      .limit(1);

    if (!section) {
      return errorResponse(res, 'Section not found', 'NOT_FOUND', 404);
    }

    // Verify ownership
    const isOwner = await verifyProposalOwnership(section.proposalId, req.user.id);
    if (!isOwner) {
      return errorResponse(res, 'Unauthorized', 'UNAUTHORIZED', 403);
    }

    // Update section
    const [updated] = await db
      .update(proposalSections)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(proposalSections.id, id))
      .returning();

    return res.json({
      data: updated,
      success: true,
    });

  } catch (error) {
    console.error('Update section error:', error);
    return errorResponse(
      res,
      'Failed to update section',
      'UPDATE_ERROR',
      500
    );
  }
});

// DELETE /api/proposal-sections/:id - Delete a section
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    const { id } = req.params;

    // Get section to verify ownership
    const [section] = await db
      .select()
      .from(proposalSections)
      .where(eq(proposalSections.id, id))
      .limit(1);

    if (!section) {
      return errorResponse(res, 'Section not found', 'NOT_FOUND', 404);
    }

    // Verify ownership
    const isOwner = await verifyProposalOwnership(section.proposalId, req.user.id);
    if (!isOwner) {
      return errorResponse(res, 'Unauthorized', 'UNAUTHORIZED', 403);
    }

    // Delete section
    const [deleted] = await db
      .delete(proposalSections)
      .where(eq(proposalSections.id, id))
      .returning();

    return res.json({
      data: deleted,
      success: true,
    });

  } catch (error) {
    console.error('Delete section error:', error);
    return errorResponse(
      res,
      'Failed to delete section',
      'DELETE_ERROR',
      500
    );
  }
});

export default router;
