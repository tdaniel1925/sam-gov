// =============================================================================
// STRIPE WEBHOOKS
// Following CodeBakers pattern 05-payments.md + 03-api.md
// Handles subscription lifecycle events from Stripe
// =============================================================================

import { Router, Request, Response } from 'express';
import { db } from '../db';
import { subscriptions } from '../db/schema';
import { eq } from 'drizzle-orm';
import { verifyWebhookSignature, STRIPE_PLANS } from '../lib/stripe';
import Stripe from 'stripe';

const router = Router();

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 *
 * IMPORTANT: This endpoint needs raw body for signature verification
 * Configure in index.ts with express.raw() middleware
 */
router.post('/stripe', async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      res.status(400).json({
        error: 'Missing stripe-signature header',
        code: 'MISSING_SIGNATURE',
      });
      return;
    }

    // Handle signature as string or array
    const signatureString = Array.isArray(signature) ? signature[0] : signature;

    // Verify webhook signature
    const event = verifyWebhookSignature(req.body, signatureString);

    console.log(`Received Stripe webhook: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({
      error: 'Webhook processing failed',
      code: 'WEBHOOK_ERROR',
      message: (error as Error).message,
    });
  }
});

// =============================================================================
// WEBHOOK EVENT HANDLERS
// =============================================================================

/**
 * Handle checkout.session.completed
 * Creates subscription record when checkout is successful
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const teamId = session.metadata?.teamId;
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  if (!teamId || !subscriptionId) {
    console.error('Missing teamId or subscriptionId in checkout session');
    return;
  }

  // Get subscription details from Stripe
  const stripe = (await import('../lib/stripe')).stripe;
  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Determine plan from price ID
  const priceId = stripeSubscription.items.data[0].price.id;
  let plan: 'professional' | 'business' | 'enterprise' = 'professional';
  let seats = 1;

  for (const [planKey, planData] of Object.entries(STRIPE_PLANS)) {
    if (planData.monthly === priceId || planData.yearly === priceId) {
      plan = planKey as 'professional' | 'business' | 'enterprise';
      seats = planData.seats;
      break;
    }
  }

  // Create or update subscription record
  const existingSubscription = await db.select()
    .from(subscriptions)
    .where(eq(subscriptions.teamId, teamId))
    .limit(1);

  const subscriptionData = {
    plan,
    status: stripeSubscription.status === 'active' ? 'active' as const : stripeSubscription.status as any,
    provider: 'stripe' as const,
    stripeSubscriptionId: subscriptionId,
    stripeCustomerId: customerId,
    currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
    currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
    cancelAtPeriodEnd: (stripeSubscription as any).cancel_at_period_end || false,
    seatsIncluded: seats,
    updatedAt: new Date(),
  };

  if (existingSubscription.length > 0) {
    await db.update(subscriptions)
      .set(subscriptionData)
      .where(eq(subscriptions.id, existingSubscription[0].id));
  } else {
    await db.insert(subscriptions).values({
      ...subscriptionData,
      teamId,
      seatsUsed: 1, // Team owner
    });
  }

  console.log(`Subscription created/updated for team ${teamId}`);
}

/**
 * Handle customer.subscription.updated
 * Updates subscription status and plan changes
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const teamId = subscription.metadata?.teamId;

  if (!teamId) {
    console.error('Missing teamId in subscription metadata');
    return;
  }

  // Determine plan from price ID
  const priceId = subscription.items.data[0].price.id;
  let plan: 'professional' | 'business' | 'enterprise' = 'professional';
  let seats = 1;

  for (const [planKey, planData] of Object.entries(STRIPE_PLANS)) {
    if (planData.monthly === priceId || planData.yearly === priceId) {
      plan = planKey as 'professional' | 'business' | 'enterprise';
      seats = planData.seats;
      break;
    }
  }

  await db.update(subscriptions)
    .set({
      plan,
      status: subscription.status === 'active' ? 'active' as const : subscription.status as any,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end || false,
      seatsIncluded: seats,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.teamId, teamId));

  console.log(`Subscription updated for team ${teamId}`);
}

/**
 * Handle customer.subscription.deleted
 * Marks subscription as canceled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const teamId = subscription.metadata?.teamId;

  if (!teamId) {
    console.error('Missing teamId in subscription metadata');
    return;
  }

  await db.update(subscriptions)
    .set({
      status: 'canceled',
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.teamId, teamId));

  console.log(`Subscription canceled for team ${teamId}`);
}

/**
 * Handle invoice.payment_succeeded
 * Updates subscription status to active on successful payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;

  if (!subscriptionId) {
    return;
  }

  // Get subscription to find teamId
  const stripe = (await import('../lib/stripe')).stripe;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const teamId = subscription.metadata?.teamId;

  if (!teamId) {
    return;
  }

  await db.update(subscriptions)
    .set({
      status: 'active',
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.teamId, teamId));

  console.log(`Payment succeeded for team ${teamId}`);
}

/**
 * Handle invoice.payment_failed
 * Updates subscription status to past_due on failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;

  if (!subscriptionId) {
    return;
  }

  // Get subscription to find teamId
  const stripe = (await import('../lib/stripe')).stripe;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const teamId = subscription.metadata?.teamId;

  if (!teamId) {
    return;
  }

  await db.update(subscriptions)
    .set({
      status: 'past_due',
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.teamId, teamId));

  console.log(`Payment failed for team ${teamId}`);
}

export default router;
