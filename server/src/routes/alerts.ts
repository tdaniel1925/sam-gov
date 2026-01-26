// =============================================================================
// ALERTS ROUTES - Email Alert Management
// Following CodeBakers pattern 03-api.md
// =============================================================================

import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createAlertSchema = z.object({
  name: z.string().min(1, 'Alert name is required'),
  naics_codes: z.array(z.string()).min(1, 'At least one NAICS code is required'),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
});

const updateAlertSchema = z.object({
  name: z.string().optional(),
  naics_codes: z.array(z.string()).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  enabled: z.boolean().optional(),
});

// Standardized error response
function errorResponse(
  res: Response,
  message: string,
  code: string,
  status: number,
  details?: Record<string, string[]>
) {
  return res.status(status).json({
    error: message,
    code,
    details,
  });
}

// GET /api/alerts - Get user's alerts
router.get('/', async (req: Request, res: Response) => {
  try {
    // In a real implementation, this would get the user ID from auth middleware
    // For now, we'll return mock data
    const mockAlerts = [
      {
        id: '1',
        user_id: 'user_123',
        name: 'IT Services Opportunities',
        naics_codes: ['541511', '541512'],
        frequency: 'daily',
        enabled: true,
        created_at: '2026-01-20T00:00:00Z',
        updated_at: '2026-01-25T00:00:00Z',
        last_sent: '2026-01-25T08:00:00Z',
        opportunities_found: 12
      },
      {
        id: '2', 
        user_id: 'user_123',
        name: 'Engineering Contracts',
        naics_codes: ['541330'],
        frequency: 'weekly',
        enabled: true,
        created_at: '2026-01-15T00:00:00Z',
        updated_at: '2026-01-22T00:00:00Z',
        last_sent: '2026-01-22T08:00:00Z',
        opportunities_found: 8
      }
    ];

    return res.json({
      data: mockAlerts,
      success: true,
    });

  } catch (error) {
    console.error('Get alerts error:', error);
    return errorResponse(
      res,
      'Failed to retrieve alerts',
      'GET_ALERTS_ERROR',
      500
    );
  }
});

// POST /api/alerts - Create new alert
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const result = createAlertSchema.safeParse(req.body);

    if (!result.success) {
      return errorResponse(
        res,
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        result.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { name, naics_codes, frequency } = result.data;

    // In a real implementation, this would save to database
    const newAlert = {
      id: Date.now().toString(),
      user_id: 'user_123', // This would come from auth middleware
      name,
      naics_codes,
      frequency,
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('Creating new alert:', newAlert);

    return res.status(201).json({
      data: newAlert,
      success: true,
    });

  } catch (error) {
    console.error('Create alert error:', error);
    return errorResponse(
      res,
      'Failed to create alert',
      'CREATE_ALERT_ERROR',
      500
    );
  }
});

// PUT /api/alerts/:id - Update alert
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const alertId = req.params.id;
    
    // Validate request body
    const result = updateAlertSchema.safeParse(req.body);

    if (!result.success) {
      return errorResponse(
        res,
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        result.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const updates = result.data;

    // In a real implementation, this would update in database
    const updatedAlert = {
      id: alertId,
      user_id: 'user_123',
      ...updates,
      updated_at: new Date().toISOString(),
    };

    console.log('Updating alert:', alertId, updates);

    return res.json({
      data: updatedAlert,
      success: true,
    });

  } catch (error) {
    console.error('Update alert error:', error);
    return errorResponse(
      res,
      'Failed to update alert',
      'UPDATE_ALERT_ERROR',
      500
    );
  }
});

// DELETE /api/alerts/:id - Delete alert
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const alertId = req.params.id;

    // In a real implementation, this would delete from database
    console.log('Deleting alert:', alertId);

    return res.json({
      success: true,
      message: 'Alert deleted successfully',
    });

  } catch (error) {
    console.error('Delete alert error:', error);
    return errorResponse(
      res,
      'Failed to delete alert',
      'DELETE_ALERT_ERROR',
      500
    );
  }
});

// POST /api/alerts/:id/test - Send test alert
router.post('/:id/test', async (req: Request, res: Response) => {
  try {
    const alertId = req.params.id;

    // In a real implementation, this would:
    // 1. Fetch current opportunities matching the alert criteria
    // 2. Send a test email to the user
    // 3. Return the results

    console.log('Sending test alert for:', alertId);

    return res.json({
      success: true,
      message: 'Test alert sent successfully',
      opportunities_found: 5, // Mock data
    });

  } catch (error) {
    console.error('Test alert error:', error);
    return errorResponse(
      res,
      'Failed to send test alert',
      'TEST_ALERT_ERROR',
      500
    );
  }
});

// GET /api/alerts/schedule - Get alert schedule/history
router.get('/schedule', async (req: Request, res: Response) => {
  try {
    // Mock schedule data
    const mockSchedule = [
      {
        id: '1',
        alert_id: '1',
        alert_name: 'IT Services Opportunities',
        scheduled_for: '2026-01-26T08:00:00Z',
        status: 'sent',
        opportunities_found: 12,
        sent_at: '2026-01-26T08:05:23Z'
      },
      {
        id: '2',
        alert_id: '2', 
        alert_name: 'Engineering Contracts',
        scheduled_for: '2026-01-29T08:00:00Z',
        status: 'pending',
        opportunities_found: 0
      }
    ];

    return res.json({
      data: mockSchedule,
      success: true,
    });

  } catch (error) {
    console.error('Get schedule error:', error);
    return errorResponse(
      res,
      'Failed to retrieve schedule',
      'GET_SCHEDULE_ERROR',
      500
    );
  }
});

export default router;