// =============================================================================
// SUBSCRIPTION API ROUTES
// Following CodeBakers pattern 05-payments.md + 03-api.md
// Handles checkout, portal, subscription management
// =============================================================================

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { db } from '../db';
import { users, teams, subscriptions, teamMembers } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import {
  getOrCreateStripeCustomer,
  createCheckoutSession,
  createPortalSession,
  cancelSubscription,
  updateSubscription,
  STRIPE_PLANS,
} from '../lib/stripe';

const router = Router();

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const createCheckoutSchema = z.object({
  plan: z.enum(['professional', 'business', 'enterprise']),
  interval: z.enum(['monthly', 'yearly']).default('monthly'),
  teamId: z.string().uuid(),
});

const updateSubscriptionSchema = z.object({
  plan: z.enum(['professional', 'business', 'enterprise']),
  interval: z.enum(['monthly', 'yearly']).default('monthly'),
});

const cancelSubscriptionSchema = z.object({
  cancelAtPeriodEnd: z.boolean().default(true),
});

// =============================================================================
// ROUTES
// =============================================================================

/**
 * POST /api/subscriptions/checkout
 * Create Stripe checkout session
 */
router.post('/checkout', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        code: 'NO_USER',
      });
      return;
    }

    // Validate request body
    const validation = createCheckoutSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: validation.error.errors,
      });
      return;
    }

    const { plan, interval, teamId } = validation.data;

    // Verify user is admin of the team
    const [membership] = await db.select()
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, req.user.id),
          eq(teamMembers.role, 'admin')
        )
      )
      .limit(1);

    if (!membership) {
      res.status(403).json({
        error: 'Forbidden',
        code: 'NOT_TEAM_ADMIN',
        message: 'You must be a team admin to manage subscriptions',
      });
      return;
    }

    // Get user profile
    const [userProfile] = await db.select()
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (!userProfile) {
      res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
      return;
    }

    // Create or get Stripe customer
    const customer = await getOrCreateStripeCustomer({
      userId: req.user.id,
      email: userProfile.email,
      name: userProfile.fullName || undefined,
    });

    // Get price ID for the selected plan
    const priceId = interval === 'monthly'
      ? STRIPE_PLANS[plan].monthly
      : STRIPE_PLANS[plan].yearly;

    if (!priceId) {
      res.status(500).json({
        error: 'Price not configured',
        code: 'PRICE_NOT_CONFIGURED',
        message: `Stripe price for ${plan} ${interval} is not configured`,
      });
      return;
    }

    // Create checkout session
    const session = await createCheckoutSession({
      customerId: customer.id,
      priceId,
      successUrl: `${process.env.CLIENT_URL}/dashboard/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.CLIENT_URL}/dashboard/subscription/cancel`,
      teamId,
    });

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Create checkout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'CHECKOUT_ERROR',
      message: (error as Error).message,
    });
  }
});

/**
 * POST /api/subscriptions/portal
 * Create customer portal session
 */
router.post('/portal', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        code: 'NO_USER',
      });
      return;
    }

    // Get user's current team subscription
    const [userProfile] = await db.select()
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (!userProfile || !userProfile.currentTeamId) {
      res.status(404).json({
        error: 'No active team',
        code: 'NO_TEAM',
      });
      return;
    }

    const [subscription] = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.teamId, userProfile.currentTeamId))
      .limit(1);

    if (!subscription || !subscription.stripeCustomerId) {
      res.status(404).json({
        error: 'No active subscription',
        code: 'NO_SUBSCRIPTION',
      });
      return;
    }

    // Create portal session
    const session = await createPortalSession({
      customerId: subscription.stripeCustomerId,
      returnUrl: `${process.env.CLIENT_URL}/dashboard/subscription`,
    });

    res.json({
      url: session.url,
    });
  } catch (error) {
    console.error('Create portal error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'PORTAL_ERROR',
      message: (error as Error).message,
    });
  }
});

/**
 * GET /api/subscriptions/current
 * Get current user's team subscription
 */
router.get('/current', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        code: 'NO_USER',
      });
      return;
    }

    // Get user's current team
    const [userProfile] = await db.select()
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (!userProfile || !userProfile.currentTeamId) {
      res.json({ subscription: null });
      return;
    }

    // Get subscription
    const [subscription] = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.teamId, userProfile.currentTeamId))
      .limit(1);

    res.json({
      subscription: subscription || null,
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'GET_SUBSCRIPTION_ERROR',
    });
  }
});

/**
 * PUT /api/subscriptions/update
 * Update subscription plan
 */
router.put('/update', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        code: 'NO_USER',
      });
      return;
    }

    // Validate request body
    const validation = updateSubscriptionSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: validation.error.errors,
      });
      return;
    }

    const { plan, interval } = validation.data;

    // Get user's current team subscription
    const [userProfile] = await db.select()
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (!userProfile || !userProfile.currentTeamId) {
      res.status(404).json({
        error: 'No active team',
        code: 'NO_TEAM',
      });
      return;
    }

    // Verify user is admin
    const [membership] = await db.select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, userProfile.currentTeamId),
          eq(teamMembers.userId, req.user.id),
          eq(teamMembers.role, 'admin')
        )
      )
      .limit(1);

    if (!membership) {
      res.status(403).json({
        error: 'Forbidden',
        code: 'NOT_TEAM_ADMIN',
      });
      return;
    }

    const [subscription] = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.teamId, userProfile.currentTeamId))
      .limit(1);

    if (!subscription || !subscription.stripeSubscriptionId) {
      res.status(404).json({
        error: 'No active subscription',
        code: 'NO_SUBSCRIPTION',
      });
      return;
    }

    // Get price ID
    const priceId = interval === 'monthly'
      ? STRIPE_PLANS[plan].monthly
      : STRIPE_PLANS[plan].yearly;

    if (!priceId) {
      res.status(500).json({
        error: 'Price not configured',
        code: 'PRICE_NOT_CONFIGURED',
      });
      return;
    }

    // Update subscription in Stripe
    await updateSubscription({
      subscriptionId: subscription.stripeSubscriptionId,
      priceId,
    });

    res.json({
      message: 'Subscription updated successfully',
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'UPDATE_SUBSCRIPTION_ERROR',
      message: (error as Error).message,
    });
  }
});

/**
 * POST /api/subscriptions/cancel
 * Cancel subscription
 */
router.post('/cancel', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        code: 'NO_USER',
      });
      return;
    }

    // Validate request body
    const validation = cancelSubscriptionSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: validation.error.errors,
      });
      return;
    }

    const { cancelAtPeriodEnd } = validation.data;

    // Get user's current team subscription
    const [userProfile] = await db.select()
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (!userProfile || !userProfile.currentTeamId) {
      res.status(404).json({
        error: 'No active team',
        code: 'NO_TEAM',
      });
      return;
    }

    // Verify user is admin
    const [membership] = await db.select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, userProfile.currentTeamId),
          eq(teamMembers.userId, req.user.id),
          eq(teamMembers.role, 'admin')
        )
      )
      .limit(1);

    if (!membership) {
      res.status(403).json({
        error: 'Forbidden',
        code: 'NOT_TEAM_ADMIN',
      });
      return;
    }

    const [subscription] = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.teamId, userProfile.currentTeamId))
      .limit(1);

    if (!subscription || !subscription.stripeSubscriptionId) {
      res.status(404).json({
        error: 'No active subscription',
        code: 'NO_SUBSCRIPTION',
      });
      return;
    }

    // Cancel subscription in Stripe
    await cancelSubscription(subscription.stripeSubscriptionId, cancelAtPeriodEnd);

    // Update database
    await db.update(subscriptions)
      .set({ cancelAtPeriodEnd })
      .where(eq(subscriptions.id, subscription.id));

    res.json({
      message: cancelAtPeriodEnd
        ? 'Subscription will be canceled at the end of the billing period'
        : 'Subscription canceled immediately',
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'CANCEL_SUBSCRIPTION_ERROR',
      message: (error as Error).message,
    });
  }
});

export default router;
