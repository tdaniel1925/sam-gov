// =============================================================================
// AUTHENTICATION API ROUTES
// Following CodeBakers pattern 02-auth.md + 03-api.md
// Handles signup, login, logout, password reset
// =============================================================================

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';
import { db } from '../db';
import { users, teams, teamMembers, subscriptions } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(1, 'Full name is required').optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const updatePasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

// =============================================================================
// ROUTES
// =============================================================================

/**
 * POST /api/auth/signup
 * Create a new user account
 */
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validation = signupSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: validation.error.errors,
      });
      return;
    }

    const { email, password, fullName } = validation.data;

    // Create auth user in Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      res.status(400).json({
        error: 'Signup failed',
        code: 'SIGNUP_ERROR',
        message: authError.message,
      });
      return;
    }

    if (!authData.user) {
      res.status(500).json({
        error: 'Signup failed',
        code: 'NO_USER_CREATED',
      });
      return;
    }

    // Create user record in our database
    await db.insert(users).values({
      id: authData.user.id,
      email: authData.user.email!,
      fullName: fullName || null,
      onboardingCompleted: false,
    });

    // Create default team for the user
    const teamSlug = `${email.split('@')[0]}-${Date.now()}`;
    const [team] = await db.insert(teams).values({
      name: `${fullName || email}'s Team`,
      slug: teamSlug,
      ownerId: authData.user.id,
    }).returning();

    // Add user as team member
    await db.insert(teamMembers).values({
      teamId: team.id,
      userId: authData.user.id,
      role: 'admin',
      invitedBy: authData.user.id,
      acceptedAt: new Date(),
    });

    // Update user's current team
    await db.update(users)
      .set({ currentTeamId: team.id })
      .where(eq(users.id, authData.user.id));

    res.status(201).json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        fullName,
      },
      session: authData.session,
      message: 'Account created successfully. Please check your email to verify your account.',
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'SIGNUP_ERROR',
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and create session
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: validation.error.errors,
      });
      return;
    }

    const { email, password } = validation.data;

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      res.status(401).json({
        error: 'Authentication failed',
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
      return;
    }

    if (!data.user || !data.session) {
      res.status(401).json({
        error: 'Authentication failed',
        code: 'NO_SESSION',
      });
      return;
    }

    // Get user profile from our database
    const [userProfile] = await db.select()
      .from(users)
      .where(eq(users.id, data.user.id))
      .limit(1);

    res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: userProfile?.fullName,
        currentTeamId: userProfile?.currentTeamId,
        onboardingCompleted: userProfile?.onboardingCompleted,
      },
      session: data.session,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'LOGIN_ERROR',
    });
  }
});

/**
 * POST /api/auth/logout
 * End user session
 */
router.post('/logout', requireAuth, async (_req: Request, res: Response): Promise<void> => {
  try {
    // Supabase handles session management client-side
    // This endpoint is mainly for logging/auditing purposes
    res.json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'LOGOUT_ERROR',
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        code: 'NO_USER',
      });
      return;
    }

    // Get user profile from database
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

    // Get user's team memberships
    const teamMemberships = await db.select({
      teamId: teamMembers.teamId,
      role: teamMembers.role,
      teamName: teams.name,
      teamSlug: teams.slug,
    })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.userId, req.user.id));

    // Get subscription if user is on a team
    let subscription = null;
    if (userProfile.currentTeamId) {
      const [sub] = await db.select()
        .from(subscriptions)
        .where(eq(subscriptions.teamId, userProfile.currentTeamId))
        .limit(1);
      subscription = sub || null;
    }

    res.json({
      user: {
        id: userProfile.id,
        email: userProfile.email,
        fullName: userProfile.fullName,
        avatarUrl: userProfile.avatarUrl,
        currentTeamId: userProfile.currentTeamId,
        onboardingCompleted: userProfile.onboardingCompleted,
      },
      teams: teamMemberships,
      subscription,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'PROFILE_ERROR',
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Request password reset email
 */
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = resetPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: validation.error.errors,
      });
      return;
    }

    const { email } = validation.data;

    // Send password reset email via Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CLIENT_URL}/reset-password`,
    });

    if (error) {
      res.status(400).json({
        error: 'Password reset failed',
        code: 'RESET_ERROR',
        message: error.message,
      });
      return;
    }

    // Always return success (don't reveal if email exists)
    res.json({
      message: 'If an account exists with that email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'RESET_ERROR',
    });
  }
});

/**
 * POST /api/auth/update-password
 * Update password (requires auth)
 */
router.post('/update-password', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = updatePasswordSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: validation.error.errors,
      });
      return;
    }

    const { newPassword } = validation.data;

    // Update password via Supabase
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      res.status(400).json({
        error: 'Password update failed',
        code: 'UPDATE_ERROR',
        message: error.message,
      });
      return;
    }

    res.json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'UPDATE_ERROR',
    });
  }
});

export default router;
