// =============================================================================
// API KEY MANAGEMENT ROUTES
// Endpoints for users to manage their SAM.gov and OpenAI API keys
// =============================================================================

import { Router } from 'express';
import { db } from '../db';
import { apiKeys, users } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import {
  encryptApiKey,
  decryptApiKey,
  maskApiKey,
  validateApiKeyFormat,
} from '../services/encryptionService';
import { AuthRequest } from '../middleware/rateLimiter';

const router = Router();

/**
 * GET /api/api-keys
 * Get user's API keys (masked)
 */
router.get('/', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const userKeys = await db
      .select({
        id: apiKeys.id,
        provider: apiKeys.provider,
        keyName: apiKeys.keyName,
        encryptedKey: apiKeys.encryptedKey,
        isValid: apiKeys.isValid,
        lastValidated: apiKeys.lastValidated,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.userId, req.user.id));

    // Mask the keys for security
    const maskedKeys = userKeys.map((key) => {
      try {
        const decrypted = decryptApiKey(key.encryptedKey);
        return {
          id: key.id,
          provider: key.provider,
          keyName: key.keyName,
          maskedKey: maskApiKey(decrypted),
          isValid: key.isValid,
          lastValidated: key.lastValidated,
          createdAt: key.createdAt,
        };
      } catch (error) {
        console.error('Error decrypting key:', error);
        return {
          id: key.id,
          provider: key.provider,
          keyName: key.keyName,
          maskedKey: '****',
          isValid: false,
          lastValidated: key.lastValidated,
          createdAt: key.createdAt,
        };
      }
    });

    res.json({
      success: true,
      keys: maskedKeys,
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch API keys',
    });
  }
});

/**
 * POST /api/api-keys
 * Add or update an API key
 */
router.post('/', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const { provider, apiKey, keyName } = req.body;

    // Validate input
    if (!provider || !apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Provider and API key are required',
      });
    }

    if (provider !== 'sam_gov' && provider !== 'openai') {
      return res.status(400).json({
        success: false,
        error: 'Invalid provider. Must be "sam_gov" or "openai"',
      });
    }

    // Validate API key format
    if (!validateApiKeyFormat(apiKey, provider)) {
      return res.status(400).json({
        success: false,
        error: `Invalid ${provider === 'sam_gov' ? 'SAM.gov' : 'OpenAI'} API key format`,
      });
    }

    // Encrypt the API key
    const encryptedKey = encryptApiKey(apiKey);

    // Check if user already has a key for this provider
    const existingKey = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.userId, req.user.id), eq(apiKeys.provider, provider)))
      .limit(1);

    if (existingKey.length > 0) {
      // Update existing key
      await db
        .update(apiKeys)
        .set({
          encryptedKey,
          keyName: keyName || `${provider} key`,
          isValid: true,
          lastValidated: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(apiKeys.id, existingKey[0].id));

      res.json({
        success: true,
        message: 'API key updated successfully',
        keyId: existingKey[0].id,
        maskedKey: maskApiKey(apiKey),
      });
    } else {
      // Insert new key
      const [newKey] = await db
        .insert(apiKeys)
        .values({
          userId: req.user.id,
          provider,
          keyName: keyName || `${provider} key`,
          encryptedKey,
          isValid: true,
          lastValidated: new Date(),
        })
        .returning({ id: apiKeys.id });

      res.json({
        success: true,
        message: 'API key added successfully',
        keyId: newKey.id,
        maskedKey: maskApiKey(apiKey),
      });
    }
  } catch (error) {
    console.error('Error saving API key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save API key',
    });
  }
});

/**
 * DELETE /api/api-keys/:id
 * Delete an API key
 */
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const { id } = req.params;

    // Delete the key (only if it belongs to the user)
    const result = await db
      .delete(apiKeys)
      .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, req.user.id)))
      .returning({ id: apiKeys.id });

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'API key not found',
      });
    }

    res.json({
      success: true,
      message: 'API key deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete API key',
    });
  }
});

/**
 * GET /api/api-keys/status
 * Get user's tier and rate limit status
 */
router.get('/status', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const [user] = await db
      .select({
        tier: users.tier,
        dailySearchesUsed: users.dailySearchesUsed,
        lastSearchDate: users.lastSearchDate,
        setupFeePaid: users.setupFeePaid,
      })
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Calculate rate limit status
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastSearch = user.lastSearchDate ? new Date(user.lastSearchDate) : null;
    const isNewDay = !lastSearch || lastSearch < today;

    const FREE_TIER_DAILY_LIMIT = 1;
    const used = isNewDay ? 0 : (user.dailySearchesUsed || 0);
    const remaining = user.tier === 'paid' ? 999 : Math.max(0, FREE_TIER_DAILY_LIMIT - used);

    res.json({
      success: true,
      tier: user.tier,
      setupFeePaid: user.setupFeePaid,
      isPaidTier: user.tier === 'paid',
      rateLimit: {
        used,
        limit: user.tier === 'paid' ? null : FREE_TIER_DAILY_LIMIT,
        remaining,
        unlimited: user.tier === 'paid',
        resetAt: user.tier === 'free' ? new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString() : null,
      },
    });
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch status',
    });
  }
});

/**
 * Helper function to get user's decrypted API key
 * Used internally by other services
 */
export async function getUserApiKey(
  userId: string,
  provider: 'sam_gov' | 'openai'
): Promise<string | null> {
  try {
    const [key] = await db
      .select({ encryptedKey: apiKeys.encryptedKey })
      .from(apiKeys)
      .where(and(eq(apiKeys.userId, userId), eq(apiKeys.provider, provider)))
      .limit(1);

    if (!key) {
      return null;
    }

    return decryptApiKey(key.encryptedKey);
  } catch (error) {
    console.error(`Error getting ${provider} API key:`, error);
    return null;
  }
}

export default router;
