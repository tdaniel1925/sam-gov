// =============================================================================
// SUBSCRIPTION MANAGEMENT PAGE
// Following CodeBakers pattern 05-payments.md + 04-frontend.md
// Stripe subscription management with pricing tiers and billing portal
// =============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionAPI } from '../lib/api';
import { toast } from 'sonner';

interface PricingTier {
  name: string;
  plan: 'professional' | 'business' | 'enterprise';
  price: number;
  seats: number;
  features: string[];
  popular?: boolean;
}

const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Professional',
    plan: 'professional',
    price: 499,
    seats: 1,
    features: [
      '1 user seat',
      'Unlimited opportunity searches',
      'Email notifications',
      'Basic AI analysis',
      'Export to CSV/PDF',
      'Priority support',
    ],
  },
  {
    name: 'Business',
    plan: 'business',
    price: 999,
    seats: 3,
    features: [
      '3 user seats',
      'Everything in Professional',
      'Advanced AI scoring',
      'Auto-monitoring (hourly)',
      'Requirement extraction',
      'Team collaboration',
      'Custom templates',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    plan: 'enterprise',
    price: 1699,
    seats: 10,
    features: [
      '10 user seats',
      'Everything in Business',
      'Predictive AI ranking',
      'Company profile auto-fill',
      'Priority API access',
      'Dedicated support',
      'Custom integrations',
    ],
  },
];

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { user, profile, subscription, loading: authLoading } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleSubscribe = async (plan: string) => {
    if (!profile?.currentTeamId) {
      toast.error('No team found. Please contact support.');
      return;
    }

    setLoadingPlan(plan);
    try {
      const { data } = await subscriptionAPI.createCheckout({
        plan,
        interval: 'monthly',
        teamId: profile.currentTeamId,
      });

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(error.response?.data?.error || 'Failed to start subscription');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageBilling = async () => {
    setIsLoadingPortal(true);
    try {
      const { data } = await subscriptionAPI.createPortal();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to open billing portal');
      }
    } catch (error: any) {
      console.error('Portal error:', error);
      toast.error(error.response?.data?.error || 'Failed to open billing portal');
    } finally {
      setIsLoadingPortal(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const currentPlan = subscription?.plan || 'none';
  const subscriptionStatus = subscription?.status || 'none';
  const isActive = subscriptionStatus === 'active';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Unlock powerful features to win more government contracts
          </p>
        </div>

        {/* Current Subscription Banner */}
        {subscription && (
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Current Subscription
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Plan: <span className="font-medium capitalize">{currentPlan}</span>
                  {' • '}
                  Status: <span className="font-medium capitalize">{subscriptionStatus}</span>
                  {subscription.currentPeriodEnd && (
                    <>
                      {' • '}
                      Renews: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </>
                  )}
                </p>
              </div>
              <button
                onClick={handleManageBilling}
                disabled={isLoadingPortal}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoadingPortal ? 'Loading...' : 'Manage Billing'}
              </button>
            </div>
          </div>
        )}

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {PRICING_TIERS.map((tier) => {
            const isCurrentPlan = currentPlan === tier.plan;
            const isLoading = loadingPlan === tier.plan;

            return (
              <div
                key={tier.plan}
                className={`relative bg-white rounded-lg shadow-lg overflow-hidden ${
                  tier.popular ? 'ring-2 ring-blue-600' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    Most Popular
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>

                  <div className="mt-4 flex items-baseline">
                    <span className="text-5xl font-extrabold text-gray-900">
                      ${tier.price}
                    </span>
                    <span className="ml-2 text-xl text-gray-500">/month</span>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    {tier.seats} user seat{tier.seats > 1 ? 's' : ''} included
                  </p>

                  <ul className="mt-8 space-y-4">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg
                          className="flex-shrink-0 h-6 w-6 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="ml-3 text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    {isCurrentPlan && isActive ? (
                      <div className="w-full text-center py-3 px-6 border-2 border-green-600 text-green-600 font-semibold rounded-md">
                        Current Plan
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSubscribe(tier.plan)}
                        disabled={isLoading || !!loadingPlan}
                        className={`w-full py-3 px-6 rounded-md font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                          tier.popular
                            ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                            : 'bg-gray-800 hover:bg-gray-900 focus:ring-gray-500'
                        }`}
                      >
                        {isLoading ? 'Processing...' : isCurrentPlan ? 'Reactivate' : 'Subscribe'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-600">
            All plans include a 14-day money-back guarantee. Cancel anytime.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Need more seats or custom features?{' '}
            <a href="mailto:sales@example.com" className="text-blue-600 hover:text-blue-500">
              Contact sales
            </a>
          </p>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
