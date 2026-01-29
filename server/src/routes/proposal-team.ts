// =============================================================================
// PROPOSAL TEAM MEMBERS ROUTES
// Following CodeBakers pattern 03-api.md
// =============================================================================

import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { proposalTeamMembers } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Validation schemas
const createTeamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().optional(),
  resumeText: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  clearanceLevel: z.string().optional(),
  skills: z.array(z.string()).optional(),
  hourlyRate: z.number().positive().optional(),
  availability: z.boolean().optional(),
  photoUrl: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
});

const updateTeamMemberSchema = createTeamMemberSchema.partial();

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

// GET /api/proposal-team - Get all team members for user
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    const teamMembers = await db
      .select()
      .from(proposalTeamMembers)
      .where(eq(proposalTeamMembers.userId, req.user.id))
      .orderBy(desc(proposalTeamMembers.createdAt));

    return res.json({
      data: teamMembers,
      success: true,
    });

  } catch (error) {
    console.error('Get team members error:', error);
    return errorResponse(
      res,
      'Failed to fetch team members',
      'FETCH_ERROR',
      500
    );
  }
});

// GET /api/proposal-team/:id - Get a single team member
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    const { id } = req.params;

    const [member] = await db
      .select()
      .from(proposalTeamMembers)
      .where(and(
        eq(proposalTeamMembers.id, id),
        eq(proposalTeamMembers.userId, req.user.id)
      ))
      .limit(1);

    if (!member) {
      return errorResponse(
        res,
        'Team member not found',
        'NOT_FOUND',
        404
      );
    }

    return res.json({
      data: member,
      success: true,
    });

  } catch (error) {
    console.error('Get team member error:', error);
    return errorResponse(
      res,
      'Failed to fetch team member',
      'FETCH_ERROR',
      500
    );
  }
});

// POST /api/proposal-team - Create a new team member
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    // Validate request body
    const result = createTeamMemberSchema.safeParse(req.body);

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

    // Create team member
    const [newMember] = await db
      .insert(proposalTeamMembers)
      .values({
        userId: req.user.id,
        name: data.name,
        title: data.title,
        resumeText: data.resumeText,
        certifications: data.certifications,
        clearanceLevel: data.clearanceLevel,
        skills: data.skills,
        hourlyRate: data.hourlyRate?.toString(),
        availability: data.availability ?? true,
        photoUrl: data.photoUrl,
        linkedinUrl: data.linkedinUrl,
      })
      .returning();

    return res.status(201).json({
      data: newMember,
      success: true,
    });

  } catch (error) {
    console.error('Create team member error:', error);
    return errorResponse(
      res,
      'Failed to create team member',
      'CREATE_ERROR',
      500
    );
  }
});

// PATCH /api/proposal-team/:id - Update a team member
router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    const { id } = req.params;

    // Validate request body
    const result = updateTeamMemberSchema.safeParse(req.body);

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

    // Update team member (only if user owns it)
    const [updated] = await db
      .update(proposalTeamMembers)
      .set({
        ...data,
        hourlyRate: data.hourlyRate?.toString(),
        updatedAt: new Date(),
      })
      .where(and(
        eq(proposalTeamMembers.id, id),
        eq(proposalTeamMembers.userId, req.user.id)
      ))
      .returning();

    if (!updated) {
      return errorResponse(
        res,
        'Team member not found or unauthorized',
        'NOT_FOUND',
        404
      );
    }

    return res.json({
      data: updated,
      success: true,
    });

  } catch (error) {
    console.error('Update team member error:', error);
    return errorResponse(
      res,
      'Failed to update team member',
      'UPDATE_ERROR',
      500
    );
  }
});

// DELETE /api/proposal-team/:id - Delete a team member
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    const { id } = req.params;

    // Delete team member
    const [deleted] = await db
      .delete(proposalTeamMembers)
      .where(and(
        eq(proposalTeamMembers.id, id),
        eq(proposalTeamMembers.userId, req.user.id)
      ))
      .returning();

    if (!deleted) {
      return errorResponse(
        res,
        'Team member not found or unauthorized',
        'NOT_FOUND',
        404
      );
    }

    return res.json({
      data: deleted,
      success: true,
    });

  } catch (error) {
    console.error('Delete team member error:', error);
    return errorResponse(
      res,
      'Failed to delete team member',
      'DELETE_ERROR',
      500
    );
  }
});

export default router;
