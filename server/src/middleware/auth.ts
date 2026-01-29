// =============================================================================
// AUTHENTICATION MIDDLEWARE
// Following CodeBakers pattern 02-auth.md
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    teamId?: string;
    subscriptionTier?: 'professional' | 'business' | 'enterprise';
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    req.user = {
      id: user.id,
      email: user.email || '',
      teamId: user.user_metadata?.teamId,
      subscriptionTier: user.user_metadata?.subscriptionTier
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
};

export const requireSubscription = (minTier?: 'professional' | 'business' | 'enterprise') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'UNAUTHORIZED'
        });
      }

      // For development, allow all requests
      if (process.env.NODE_ENV === 'development') {
        return next();
      }

      // TODO: Implement subscription tier checking
      // Check if user has active subscription and meets minimum tier requirement
      
      next();
    } catch (error) {
      console.error('Subscription middleware error:', error);
      res.status(403).json({
        error: 'Subscription required',
        code: 'SUBSCRIPTION_REQUIRED'
      });
    }
  };
};

export const requireAdminRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    }

    // TODO: Check if user has admin role in their team
    // For now, allow in development
    if (process.env.NODE_ENV === 'development') {
      return next();
    }

    next();
  } catch (error) {
    console.error('Admin role middleware error:', error);
    res.status(403).json({
      error: 'Admin role required',
      code: 'ADMIN_REQUIRED'
    });
  }
};