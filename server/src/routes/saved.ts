// =============================================================================
// SAVED OPPORTUNITIES ROUTES
// Following CodeBakers pattern 03-api.md
// =============================================================================

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { savedOpportunities } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// Validation schema
const saveOpportunitySchema = z.object({
  noticeId: z.string().min(1),
  title: z.string().min(1),
  solicitationNumber: z.string().optional(),
  department: z.string().optional(),
  postedDate: z.string().optional(),
  responseDeadline: z.string().optional(),
  naicsCode: z.string().optional(),
  opportunityData: z.record(z.any()),
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

// GET /api/saved - Get all saved opportunities
router.get('/', async (req: Request, res: Response) => {
  try {
    const opportunities = await db
      .select()
      .from(savedOpportunities)
      .orderBy(desc(savedOpportunities.savedAt));

    return res.json({
      data: opportunities,
      success: true,
    });

  } catch (error) {
    console.error('Get saved opportunities error:', error);
    return errorResponse(
      res,
      'Failed to fetch saved opportunities',
      'FETCH_ERROR',
      500
    );
  }
});

// POST /api/saved - Save an opportunity
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const result = saveOpportunitySchema.safeParse(req.body);

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

    // Check if already saved
    const existing = await db
      .select()
      .from(savedOpportunities)
      .where(eq(savedOpportunities.noticeId, data.noticeId))
      .limit(1);

    if (existing.length > 0) {
      return errorResponse(
        res,
        'Opportunity already saved',
        'ALREADY_EXISTS',
        409
      );
    }

    // Save opportunity
    const [saved] = await db
      .insert(savedOpportunities)
      .values({
        noticeId: data.noticeId,
        title: data.title,
        solicitationNumber: data.solicitationNumber,
        department: data.department,
        postedDate: data.postedDate,
        responseDeadline: data.responseDeadline,
        naicsCode: data.naicsCode,
        opportunityData: data.opportunityData,
        notes: data.notes,
      })
      .returning();

    return res.status(201).json({
      data: saved,
      success: true,
    });

  } catch (error) {
    console.error('Save opportunity error:', error);
    return errorResponse(
      res,
      'Failed to save opportunity',
      'SAVE_ERROR',
      500
    );
  }
});

// DELETE /api/saved/:id - Delete a saved opportunity
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await db
      .delete(savedOpportunities)
      .where(eq(savedOpportunities.id, id))
      .returning();

    if (deleted.length === 0) {
      return errorResponse(
        res,
        'Opportunity not found',
        'NOT_FOUND',
        404
      );
    }

    return res.json({
      data: deleted[0],
      success: true,
    });

  } catch (error) {
    console.error('Delete opportunity error:', error);
    return errorResponse(
      res,
      'Failed to delete opportunity',
      'DELETE_ERROR',
      500
    );
  }
});

// PATCH /api/saved/:id - Update notes
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    if (typeof notes !== 'string') {
      return errorResponse(
        res,
        'Notes must be a string',
        'VALIDATION_ERROR',
        400
      );
    }

    const [updated] = await db
      .update(savedOpportunities)
      .set({ notes })
      .where(eq(savedOpportunities.id, id))
      .returning();

    if (!updated) {
      return errorResponse(
        res,
        'Opportunity not found',
        'NOT_FOUND',
        404
      );
    }

    return res.json({
      data: updated,
      success: true,
    });

  } catch (error) {
    console.error('Update opportunity error:', error);
    return errorResponse(
      res,
      'Failed to update opportunity',
      'UPDATE_ERROR',
      500
    );
  }
});

export default router;
