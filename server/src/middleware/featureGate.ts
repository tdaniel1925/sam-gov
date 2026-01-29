// =============================================================================
// FEATURE GATING MIDDLEWARE
// Controls access to paid features
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './rateLimiter';

/**
 * Middleware to check if user has paid tier access
 * Blocks free tier users from accessing paid features
 */
export function requirePaidTier(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  // If no user, return unauthorized
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  // Check if user is paid tier
  if (req.user.tier === 'paid') {
    return next();
  }

  // User is free tier, deny access
  return res.status(403).json({
    success: false,
    error: 'Paid tier required',
    message: 'This feature requires a paid subscription. Upgrade to access AI features and unlimited searches.',
    tier: req.user.tier || 'free',
    upgradeUrl: '/profile?tab=upgrade',
  });
}

/**
 * Middleware that allows both tiers but adds tier info to response
 * Used for features that work differently based on tier
 */
export function checkTier(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  // Add tier info to response locals for later use
  res.locals.userTier = req.user?.tier || 'free';
  res.locals.isPaidTier = req.user?.tier === 'paid';
  next();
}
