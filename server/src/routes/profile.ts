// =============================================================================
// COMPANY PROFILE ROUTES
// Following CodeBakers pattern 03-api.md + 02-auth.md
// Protected with authentication middleware
// =============================================================================

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { companyProfile } from '../db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// Validation schema
const profileSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  ueiNumber: z.string().optional(),
  dunsNumber: z.string().optional(),
  cageCode: z.string().optional(),
  naicsCodes: z.array(z.string()).min(1, 'At least one NAICS code is required'),
  certifications: z.array(z.string()).optional(),
  primaryContact: z.object({
    name: z.string(),
    title: z.string(),
    email: z.string().email(),
    phone: z.string(),
  }).optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
  }).optional(),
  capabilities: z.string().optional(),
  pastPerformance: z.array(z.object({
    projectName: z.string(),
    client: z.string(),
    value: z.string(),
    year: z.string(),
    description: z.string(),
  })).optional(),
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

// GET /api/profile - Get company profile (returns first one)
router.get('/', async (req: Request, res: Response) => {
  try {
    const profiles = await db.select().from(companyProfile).limit(1);

    if (profiles.length === 0) {
      return res.json({
        data: null,
        success: true,
      });
    }

    return res.json({
      data: profiles[0],
      success: true,
    });

  } catch (error) {
    console.error('Get profile error:', error);

    if (error instanceof Error) {
      return errorResponse(
        res,
        error.message,
        'GET_PROFILE_ERROR',
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

// POST /api/profile - Create company profile
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const result = profileSchema.safeParse(req.body);

    if (!result.success) {
      return errorResponse(
        res,
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        result.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    // Check if profile already exists
    const existing = await db.select().from(companyProfile).limit(1);
    if (existing.length > 0) {
      return errorResponse(
        res,
        'Company profile already exists. Use PUT to update.',
        'PROFILE_EXISTS',
        409
      );
    }

    // Create profile
    const newProfile = await db.insert(companyProfile).values({
      ...result.data,
      certifications: result.data.certifications || [],
      pastPerformance: result.data.pastPerformance || [],
    }).returning();

    return res.status(201).json({
      data: newProfile[0],
      success: true,
    });

  } catch (error) {
    console.error('Create profile error:', error);

    if (error instanceof Error) {
      return errorResponse(
        res,
        error.message,
        'CREATE_PROFILE_ERROR',
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

// PUT /api/profile/:id - Update company profile
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate request body
    const result = profileSchema.safeParse(req.body);

    if (!result.success) {
      return errorResponse(
        res,
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        result.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    // Update profile
    const updated = await db
      .update(companyProfile)
      .set({
        ...result.data,
        certifications: result.data.certifications || [],
        pastPerformance: result.data.pastPerformance || [],
        updatedAt: new Date(),
      })
      .where(eq(companyProfile.id, id))
      .returning();

    if (updated.length === 0) {
      return errorResponse(
        res,
        'Profile not found',
        'PROFILE_NOT_FOUND',
        404
      );
    }

    return res.json({
      data: updated[0],
      success: true,
    });

  } catch (error) {
    console.error('Update profile error:', error);

    if (error instanceof Error) {
      return errorResponse(
        res,
        error.message,
        'UPDATE_PROFILE_ERROR',
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

// DELETE /api/profile/:id - Delete company profile
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await db
      .delete(companyProfile)
      .where(eq(companyProfile.id, id))
      .returning();

    if (deleted.length === 0) {
      return errorResponse(
        res,
        'Profile not found',
        'PROFILE_NOT_FOUND',
        404
      );
    }

    return res.json({
      data: deleted[0],
      success: true,
    });

  } catch (error) {
    console.error('Delete profile error:', error);

    if (error instanceof Error) {
      return errorResponse(
        res,
        error.message,
        'DELETE_PROFILE_ERROR',
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
