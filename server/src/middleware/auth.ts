// =============================================================================
// AUTHENTICATION MIDDLEWARE
// Following CodeBakers pattern 02-auth.md
// Protects routes by verifying Supabase JWT tokens
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { verifySession } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: SupabaseUser;
    }
  }
}

/**
 * Middleware to require authentication
 * Verifies JWT token from Authorization header
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        code: 'MISSING_TOKEN',
        message: 'No authentication token provided',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const { valid, user } = await verifySession(token);

    if (!valid || !user) {
      res.status(401).json({
        error: 'Unauthorized',
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired authentication token',
      });
      return;
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'AUTH_ERROR',
    });
  }
}

/**
 * Optional auth - doesn't fail if no token, but attaches user if present
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { valid, user } = await verifySession(token);

      if (valid && user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Don't fail on optional auth errors
    console.error('Optional auth error:', error);
    next();
  }
}
