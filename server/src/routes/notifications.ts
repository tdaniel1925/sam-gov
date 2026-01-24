// =============================================================================
// NOTIFICATION SUBSCRIPTIONS ROUTES
// Following CodeBakers pattern 03-api.md
// =============================================================================

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { notificationSubscriptions } from '../db/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Validation schema
const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  naicsCode: z.string().regex(/^\d{1,6}$/, 'NAICS code must be 1-6 digits'),
  frequency: z.enum(['daily', 'weekly', 'realtime']).default('daily'),
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

// GET /api/notifications - Get all subscriptions
router.get('/', async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string;

    if (!email) {
      return errorResponse(
        res,
        'Email parameter required',
        'VALIDATION_ERROR',
        400
      );
    }

    const subscriptions = await db
      .select()
      .from(notificationSubscriptions)
      .where(eq(notificationSubscriptions.email, email))
      .orderBy(notificationSubscriptions.createdAt);

    return res.json({
      data: subscriptions,
      success: true,
    });

  } catch (error) {
    console.error('Get subscriptions error:', error);
    return errorResponse(
      res,
      'Failed to fetch subscriptions',
      'FETCH_ERROR',
      500
    );
  }
});

// POST /api/notifications - Create subscription
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const result = subscribeSchema.safeParse(req.body);

    if (!result.success) {
      return errorResponse(
        res,
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        result.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { email, naicsCode, frequency } = result.data;

    // Check if subscription already exists
    const existing = await db
      .select()
      .from(notificationSubscriptions)
      .where(
        and(
          eq(notificationSubscriptions.email, email),
          eq(notificationSubscriptions.naicsCode, naicsCode)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing subscription
      const [updated] = await db
        .update(notificationSubscriptions)
        .set({
          frequency,
          active: true,
          updatedAt: new Date(),
        })
        .where(eq(notificationSubscriptions.id, existing[0].id))
        .returning();

      return res.json({
        data: updated,
        success: true,
        message: 'Subscription updated',
      });
    }

    // Create new subscription
    const [subscription] = await db
      .insert(notificationSubscriptions)
      .values({
        email,
        naicsCode,
        frequency,
        active: true,
      })
      .returning();

    return res.status(201).json({
      data: subscription,
      success: true,
      message: 'Subscription created',
    });

  } catch (error) {
    console.error('Subscribe error:', error);
    return errorResponse(
      res,
      'Failed to create subscription',
      'SUBSCRIBE_ERROR',
      500
    );
  }
});

// DELETE /api/notifications/:id - Unsubscribe
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await db
      .delete(notificationSubscriptions)
      .where(eq(notificationSubscriptions.id, id))
      .returning();

    if (deleted.length === 0) {
      return errorResponse(
        res,
        'Subscription not found',
        'NOT_FOUND',
        404
      );
    }

    return res.json({
      data: deleted[0],
      success: true,
      message: 'Unsubscribed successfully',
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return errorResponse(
      res,
      'Failed to unsubscribe',
      'UNSUBSCRIBE_ERROR',
      500
    );
  }
});

// PATCH /api/notifications/:id - Update subscription
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateSchema = z.object({
      frequency: z.enum(['daily', 'weekly', 'realtime']).optional(),
      active: z.boolean().optional(),
    });

    const result = updateSchema.safeParse(req.body);

    if (!result.success) {
      return errorResponse(
        res,
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        result.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const [updated] = await db
      .update(notificationSubscriptions)
      .set({
        ...result.data,
        updatedAt: new Date(),
      })
      .where(eq(notificationSubscriptions.id, id))
      .returning();

    if (!updated) {
      return errorResponse(
        res,
        'Subscription not found',
        'NOT_FOUND',
        404
      );
    }

    return res.json({
      data: updated,
      success: true,
    });

  } catch (error) {
    console.error('Update subscription error:', error);
    return errorResponse(
      res,
      'Failed to update subscription',
      'UPDATE_ERROR',
      500
    );
  }
});

export default router;
