// =============================================================================
// PAST PERFORMANCE PROJECTS ROUTES
// Following CodeBakers pattern 03-api.md
// =============================================================================

import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { pastPerformanceProjects } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Validation schemas
const createProjectSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  clientName: z.string().min(1, 'Client name is required'),
  contractNumber: z.string().optional(),
  contractValue: z.number().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
  outcomes: z.string().optional(),
  referenceName: z.string().optional(),
  referenceEmail: z.string().email().optional(),
  referencePhone: z.string().optional(),
  relevanceTags: z.array(z.string()).optional(),
  performanceRating: z.string().optional(),
});

const updateProjectSchema = createProjectSchema.partial();

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

// GET /api/past-performance - Get all past performance projects for user
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    const projects = await db
      .select()
      .from(pastPerformanceProjects)
      .where(eq(pastPerformanceProjects.userId, req.user.id))
      .orderBy(desc(pastPerformanceProjects.startDate));

    return res.json({
      data: projects,
      success: true,
    });

  } catch (error) {
    console.error('Get past performance projects error:', error);
    return errorResponse(
      res,
      'Failed to fetch projects',
      'FETCH_ERROR',
      500
    );
  }
});

// GET /api/past-performance/:id - Get a single project
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    const { id } = req.params;

    const [project] = await db
      .select()
      .from(pastPerformanceProjects)
      .where(and(
        eq(pastPerformanceProjects.id, id),
        eq(pastPerformanceProjects.userId, req.user.id)
      ))
      .limit(1);

    if (!project) {
      return errorResponse(
        res,
        'Project not found',
        'NOT_FOUND',
        404
      );
    }

    return res.json({
      data: project,
      success: true,
    });

  } catch (error) {
    console.error('Get project error:', error);
    return errorResponse(
      res,
      'Failed to fetch project',
      'FETCH_ERROR',
      500
    );
  }
});

// POST /api/past-performance - Create a new project
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    // Validate request body
    const result = createProjectSchema.safeParse(req.body);

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

    // Create project
    const [newProject] = await db
      .insert(pastPerformanceProjects)
      .values({
        userId: req.user.id,
        projectName: data.projectName,
        clientName: data.clientName,
        contractNumber: data.contractNumber,
        contractValue: data.contractValue?.toString(),
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        description: data.description,
        outcomes: data.outcomes,
        referenceName: data.referenceName,
        referenceEmail: data.referenceEmail,
        referencePhone: data.referencePhone,
        relevanceTags: data.relevanceTags,
        performanceRating: data.performanceRating,
      })
      .returning();

    return res.status(201).json({
      data: newProject,
      success: true,
    });

  } catch (error) {
    console.error('Create project error:', error);
    return errorResponse(
      res,
      'Failed to create project',
      'CREATE_ERROR',
      500
    );
  }
});

// PATCH /api/past-performance/:id - Update a project
router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    const { id } = req.params;

    // Validate request body
    const result = updateProjectSchema.safeParse(req.body);

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

    // Update project (only if user owns it)
    const [updated] = await db
      .update(pastPerformanceProjects)
      .set({
        ...data,
        contractValue: data.contractValue?.toString(),
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        updatedAt: new Date(),
      })
      .where(and(
        eq(pastPerformanceProjects.id, id),
        eq(pastPerformanceProjects.userId, req.user.id)
      ))
      .returning();

    if (!updated) {
      return errorResponse(
        res,
        'Project not found or unauthorized',
        'NOT_FOUND',
        404
      );
    }

    return res.json({
      data: updated,
      success: true,
    });

  } catch (error) {
    console.error('Update project error:', error);
    return errorResponse(
      res,
      'Failed to update project',
      'UPDATE_ERROR',
      500
    );
  }
});

// DELETE /api/past-performance/:id - Delete a project
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    const { id } = req.params;

    // Delete project
    const [deleted] = await db
      .delete(pastPerformanceProjects)
      .where(and(
        eq(pastPerformanceProjects.id, id),
        eq(pastPerformanceProjects.userId, req.user.id)
      ))
      .returning();

    if (!deleted) {
      return errorResponse(
        res,
        'Project not found or unauthorized',
        'NOT_FOUND',
        404
      );
    }

    return res.json({
      data: deleted,
      success: true,
    });

  } catch (error) {
    console.error('Delete project error:', error);
    return errorResponse(
      res,
      'Failed to delete project',
      'DELETE_ERROR',
      500
    );
  }
});

export default router;
