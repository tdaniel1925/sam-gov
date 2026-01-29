// =============================================================================
// NOTIFICATION PREFERENCES API
// Manage email notification settings
// =============================================================================

import { Router, Response } from 'express';
import { db } from '../db';
import { userPreferences } from '../db/schema';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { eq } from 'drizzle-orm';
import { EmailService } from '../services/email-service';

const router = Router();

// =============================================================================
// GET /api/notification-preferences
// Get user's notification preferences
// =============================================================================
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    // If no preferences exist, create default ones
    if (!prefs) {
      const [newPrefs] = await db
        .insert(userPreferences)
        .values({
          userId,
          emailFrequency: 'daily',
          emailEnabled: true,
        })
        .returning();

      return res.json({
        success: true,
        data: {
          emailEnabled: newPrefs.emailEnabled,
          emailFrequency: newPrefs.emailFrequency,
        },
      });
    }

    res.json({
      success: true,
      data: {
        emailEnabled: prefs.emailEnabled,
        emailFrequency: prefs.emailFrequency,
      },
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notification preferences',
    });
  }
});

// =============================================================================
// PATCH /api/notification-preferences
// Update user's notification preferences
// =============================================================================
router.patch('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { emailEnabled, emailFrequency } = req.body;

    // Validate emailFrequency if provided
    if (emailFrequency && !['daily', 'weekly', 'realtime', 'off'].includes(emailFrequency)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email frequency. Must be: daily, weekly, realtime, or off',
      });
    }

    // Get existing preferences
    const [existingPrefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    if (!existingPrefs) {
      // Create new preferences
      const [newPrefs] = await db
        .insert(userPreferences)
        .values({
          userId,
          emailEnabled: emailEnabled !== undefined ? emailEnabled : true,
          emailFrequency: emailFrequency || 'daily',
        })
        .returning();

      return res.json({
        success: true,
        data: {
          emailEnabled: newPrefs.emailEnabled,
          emailFrequency: newPrefs.emailFrequency,
        },
      });
    }

    // Update existing preferences
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (emailEnabled !== undefined) {
      updateData.emailEnabled = emailEnabled;
    }

    if (emailFrequency) {
      updateData.emailFrequency = emailFrequency;
    }

    const [updatedPrefs] = await db
      .update(userPreferences)
      .set(updateData)
      .where(eq(userPreferences.userId, userId))
      .returning();

    res.json({
      success: true,
      data: {
        emailEnabled: updatedPrefs.emailEnabled,
        emailFrequency: updatedPrefs.emailFrequency,
      },
      message: 'Notification preferences updated successfully',
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update notification preferences',
    });
  }
});

// =============================================================================
// POST /api/notification-preferences/test
// Send a test email to verify configuration
// =============================================================================
router.post('/test', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user!.email;

    const testOpportunities = [
      {
        title: 'Cloud Infrastructure Modernization',
        noticeId: 'TEST-001',
        agency: 'Department of Defense',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        link: `${process.env.CLIENT_URL || 'http://localhost:3000'}/opportunity/test-001`,
      },
      {
        title: 'Cybersecurity Assessment Services',
        noticeId: 'TEST-002',
        agency: 'Department of Homeland Security',
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        link: `${process.env.CLIENT_URL || 'http://localhost:3000'}/opportunity/test-002`,
      },
    ];

    const success = await EmailService.sendDailyDigest(userEmail, testOpportunities);

    if (success) {
      res.json({
        success: true,
        message: 'Test email sent successfully. Check your inbox!',
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send test email. Check server logs for details.',
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test email',
    });
  }
});

export default router;
