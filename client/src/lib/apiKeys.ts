// =============================================================================
// API KEYS CLIENT
// Frontend service for managing API keys and tier status
// =============================================================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ApiKey {
  id: string;
  provider: 'sam_gov' | 'openai';
  keyName: string;
  maskedKey: string;
  isValid: boolean;
  lastValidated: string | null;
  createdAt: string;
}

export interface TierStatus {
  tier: 'free' | 'paid';
  setupFeePaid: boolean;
  isPaidTier: boolean;
  rateLimit: {
    used: number;
    limit: number | null;
    remaining: number;
    unlimited: boolean;
    resetAt: string | null;
  };
}

export const apiKeysAPI = {
  /**
   * Get user's API keys (masked)
   */
  async getKeys(): Promise<ApiKey[]> {
    const response = await fetch(`${API_URL}/api/api-keys`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch API keys');
    }

    const result = await response.json();
    return result.keys || [];
  },

  /**
   * Save or update an API key
   */
  async saveKey(provider: 'sam_gov' | 'openai', apiKey: string, keyName?: string): Promise<{ maskedKey: string }> {
    const response = await fetch(`${API_URL}/api/api-keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ provider, apiKey, keyName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save API key');
    }

    const result = await response.json();
    return result;
  },

  /**
   * Delete an API key
   */
  async deleteKey(keyId: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/api-keys/${keyId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete API key');
    }
  },

  /**
   * Get user's tier and rate limit status
   */
  async getStatus(): Promise<TierStatus> {
    const response = await fetch(`${API_URL}/api/api-keys/status`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tier status');
    }

    const result = await response.json();
    return result;
  },
};
