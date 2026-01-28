// =============================================================================
// CONTENT BLOCKS ROUTES
// Following CodeBakers pattern 03-api.md
// Reusable content library for proposals
// =============================================================================

import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { contentBlocks } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Apply auth middleware
router.use(requireAuth);

// Validation schemas
const contentBlockSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()).optional(),
  isShared: z.boolean().optional(),
});

const updateContentBlockSchema = contentBlockSchema.partial();

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

// GET /api/content-blocks - Get all content blocks for user/team
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const category = req.query.category as string | undefined;

    if (!userId) {
      return errorResponse(res, 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    let query = db
      .select()
      .from(contentBlocks)
      .where(eq(contentBlocks.userId, userId))
      .orderBy(desc(contentBlocks.updatedAt));

    if (category) {
      const results = await db
        .select()
        .from(contentBlocks)
        .where(and(
          eq(contentBlocks.userId, userId),
          eq(contentBlocks.category, category)
        ))
        .orderBy(desc(contentBlocks.updatedAt));

      return res.json({
        data: results,
        success: true,
      });
    }

    const results = await query;

    return res.json({
      data: results,
      success: true,
    });

  } catch (error) {
    console.error('Get content blocks error:', error);

    if (error instanceof Error) {
      return errorResponse(res, error.message, 'GET_CONTENT_BLOCKS_ERROR', 500);
    }

    return errorResponse(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

// POST /api/content-blocks - Create new content block
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    const result = contentBlockSchema.safeParse(req.body);

    if (!result.success) {
      return errorResponse(
        res,
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        result.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { category, title, content, tags, isShared } = result.data;

    const [newBlock] = await db.insert(contentBlocks).values({
      userId,
      category,
      title,
      content,
      tags: tags || [],
      isShared: isShared || false,
    }).returning();

    return res.status(201).json({
      data: newBlock,
      success: true,
    });

  } catch (error) {
    console.error('Create content block error:', error);

    if (error instanceof Error) {
      return errorResponse(res, error.message, 'CREATE_CONTENT_BLOCK_ERROR', 500);
    }

    return errorResponse(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

// PATCH /api/content-blocks/:id - Update content block
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const blockId = req.params.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    const result = updateContentBlockSchema.safeParse(req.body);

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

    const [updatedBlock] = await db
      .update(contentBlocks)
      .set(updateData)
      .where(and(
        eq(contentBlocks.id, blockId),
        eq(contentBlocks.userId, userId)
      ))
      .returning();

    if (!updatedBlock) {
      return errorResponse(res, 'Content block not found', 'NOT_FOUND', 404);
    }

    return res.json({
      data: updatedBlock,
      success: true,
    });

  } catch (error) {
    console.error('Update content block error:', error);

    if (error instanceof Error) {
      return errorResponse(res, error.message, 'UPDATE_CONTENT_BLOCK_ERROR', 500);
    }

    return errorResponse(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

// DELETE /api/content-blocks/:id - Delete content block
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const blockId = req.params.id;

    if (!userId) {
      return errorResponse(res, 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    const [deletedBlock] = await db
      .delete(contentBlocks)
      .where(and(
        eq(contentBlocks.id, blockId),
        eq(contentBlocks.userId, userId)
      ))
      .returning();

    if (!deletedBlock) {
      return errorResponse(res, 'Content block not found', 'NOT_FOUND', 404);
    }

    return res.json({
      message: 'Content block deleted successfully',
      success: true,
    });

  } catch (error) {
    console.error('Delete content block error:', error);

    if (error instanceof Error) {
      return errorResponse(res, error.message, 'DELETE_CONTENT_BLOCK_ERROR', 500);
    }

    return errorResponse(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

// GET /api/content-blocks/categories - Get available categories
router.get('/categories', async (req: AuthRequest, res: Response) => {
  try {
    const categories = [
      { id: 'company-overview', label: 'Company Overview', description: 'General company information and capabilities' },
      { id: 'quality-control', label: 'Quality Control', description: 'QA/QC processes and procedures' },
      { id: 'risk-management', label: 'Risk Management', description: 'Risk mitigation strategies' },
      { id: 'security', label: 'Security', description: 'Security practices and certifications' },
      { id: 'past-performance', label: 'Past Performance', description: 'Project references and success stories' },
      { id: 'team', label: 'Team & Key Personnel', description: 'Team structure and key staff bios' },
      { id: 'methodology', label: 'Methodology', description: 'Technical approaches and methodologies' },
      { id: 'custom', label: 'Custom', description: 'Other reusable content' },
    ];

    return res.json({
      data: categories,
      success: true,
    });

  } catch (error) {
    console.error('Get categories error:', error);
    return errorResponse(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

export default router;
