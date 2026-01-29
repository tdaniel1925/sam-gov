// =============================================================================
// RATE LIMITING MIDDLEWARE
// Enforces free tier limits: 1 search per day
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    tier?: 'free' | 'paid';
    dailySearchesUsed?: number;
    lastSearchDate?: Date | null;
  };
}

/**
 * Rate limiting middleware for search endpoints
 * Free tier: 1 search per day
 * Paid tier: unlimited
 */
export async function searchRateLimit(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // If no user or user is paid tier, allow unlimited searches
    if (!req.user || req.user.tier === 'paid') {
      return next();
    }

    const userId = req.user.id;

    // Get user's current usage from database
    const [user] = await db
      .select({
        tier: users.tier,
        dailySearchesUsed: users.dailySearchesUsed,
        lastSearchDate: users.lastSearchDate,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // If user is paid tier (in case cache is stale), allow
    if (user.tier === 'paid') {
      return next();
    }

    // Check if it's a new day (reset counter)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastSearch = user.lastSearchDate ? new Date(user.lastSearchDate) : null;
    const isNewDay = !lastSearch || lastSearch < today;

    if (isNewDay) {
      // Reset counter for new day
      await db
        .update(users)
        .set({
          dailySearchesUsed: 1,
          lastSearchDate: new Date(),
        })
        .where(eq(users.id, userId));

      return next();
    }

    // Check if user has exceeded daily limit
    const searchesUsed = user.dailySearchesUsed || 0;
    const FREE_TIER_DAILY_LIMIT = 1;

    if (searchesUsed >= FREE_TIER_DAILY_LIMIT) {
      return res.status(429).json({
        success: false,
        error: 'Daily search limit exceeded',
        message: 'Free tier allows 1 search per day. Upgrade to paid tier for unlimited searches.',
        limit: FREE_TIER_DAILY_LIMIT,
        used: searchesUsed,
        resetAt: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        upgradeUrl: '/profile?tab=upgrade',
      });
    }

    // Increment search counter
    await db
      .update(users)
      .set({
        dailySearchesUsed: searchesUsed + 1,
        lastSearchDate: new Date(),
      })
      .where(eq(users.id, userId));

    // Add usage info to request for logging
    req.user.dailySearchesUsed = searchesUsed + 1;

    next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    // On error, allow the request (fail open)
    next();
  }
}

/**
 * Get user's current rate limit status
 */
export async function getRateLimitStatus(userId: string) {
  try {
    const [user] = await db
      .select({
        tier: users.tier,
        dailySearchesUsed: users.dailySearchesUsed,
        lastSearchDate: users.lastSearchDate,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    // Paid users have unlimited searches
    if (user.tier === 'paid') {
      return {
        tier: 'paid',
        unlimited: true,
        used: 0,
        limit: null,
        remaining: null,
        resetAt: null,
      };
    }

    // Free tier logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastSearch = user.lastSearchDate ? new Date(user.lastSearchDate) : null;
    const isNewDay = !lastSearch || lastSearch < today;

    const FREE_TIER_DAILY_LIMIT = 1;
    const used = isNewDay ? 0 : (user.dailySearchesUsed || 0);
    const remaining = Math.max(0, FREE_TIER_DAILY_LIMIT - used);
    const resetAt = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    return {
      tier: 'free',
      unlimited: false,
      used,
      limit: FREE_TIER_DAILY_LIMIT,
      remaining,
      resetAt: resetAt.toISOString(),
    };
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    throw error;
  }
}
