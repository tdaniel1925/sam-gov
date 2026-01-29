// =============================================================================
// STRIPE CLIENT
// Following CodeBakers pattern 05-payments.md + 06f-api-patterns.md
// Handles subscription creation, customer portal, webhooks
// =============================================================================

import Stripe from 'stripe';

// Validate environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Make Stripe optional - only initialize if key is provided
export const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  : null;

if (!STRIPE_SECRET_KEY) {
  console.warn('⚠️  STRIPE_SECRET_KEY not set - Stripe features will be disabled');
} else if (!STRIPE_WEBHOOK_SECRET) {
  console.warn('⚠️  STRIPE_WEBHOOK_SECRET not set - webhook verification will not work');
}

// Stripe Price IDs for each plan (these will be created in Stripe Dashboard)
export const STRIPE_PLANS = {
  professional: {
    monthly: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_PROFESSIONAL_YEARLY || '',
    seats: 1,
    price: 499,
  },
  business: {
    monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY || '',
    seats: 3,
    price: 999,
  },
  enterprise: {
    monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || '',
    seats: 10,
    price: 1699,
  },
} as const;

// Helper to get plan details
export function getPlanDetails(plan: 'professional' | 'business' | 'enterprise') {
  return STRIPE_PLANS[plan];
}

// Helper to verify webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${(error as Error).message}`);
  }
}

// Helper to create or retrieve customer
export async function getOrCreateStripeCustomer(params: {
  userId: string;
  email: string;
  name?: string;
}): Promise<Stripe.Customer> {
  // Search for existing customer by email
  const existingCustomers = await stripe.customers.list({
    email: params.email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer
  return stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: {
      userId: params.userId,
    },
  });
}

// Helper to create checkout session
export async function createCheckoutSession(params: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  teamId: string;
}): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    customer: params.customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      teamId: params.teamId,
    },
    subscription_data: {
      metadata: {
        teamId: params.teamId,
      },
    },
  });
}

// Helper to create customer portal session
export async function createPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });
}

// Helper to cancel subscription
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd = true
): Promise<Stripe.Subscription> {
  if (cancelAtPeriodEnd) {
    return stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  } else {
    return stripe.subscriptions.cancel(subscriptionId);
  }
}

// Helper to update subscription
export async function updateSubscription(params: {
  subscriptionId: string;
  priceId: string;
}): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(params.subscriptionId);

  return stripe.subscriptions.update(params.subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: params.priceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });
}
