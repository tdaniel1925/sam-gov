// =============================================================================
// SAM.GOV API CLIENT
// Following CodeBakers pattern 06f-api-patterns.md
// =============================================================================

// Load environment variables if not already loaded
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SAM_API_URL = process.env.SAM_API_URL || 'https://api.sam.gov/opportunities/v2';
const SAM_API_KEY = process.env.SAM_API_KEY!;

if (!SAM_API_KEY) {
  console.error('WARNING: SAM_API_KEY is not set in environment variables!');
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  apiKey?: string; // Optional: User's API key, falls back to platform key
}

export class SAMGovAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SAMGovAPIError';
  }
}

export async function samRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, apiKey, ...fetchOptions } = options;

  // Build URL with query params
  let url = `${SAM_API_URL}${endpoint}`;

  // Use user's API key if provided, otherwise fall back to platform key
  const keyToUse = apiKey || SAM_API_KEY;

  // Add API key to params
  const allParams = {
    api_key: keyToUse,
    ...(params || {}),
  };

  const searchParams = new URLSearchParams(allParams);
  url += `?${searchParams.toString()}`;

  // Debug logging
  console.log('SAM.gov API Request:', {
    endpoint,
    usingUserKey: !!apiKey,
    keySource: apiKey ? 'user' : 'platform',
    keyPreview: keyToUse ? keyToUse.substring(0, 10) + '...' : 'MISSING'
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // Handle rate limiting
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    throw new SAMGovAPIError(
      'Rate limit exceeded',
      429,
      'RATE_LIMITED',
      { retryAfter }
    );
  }

  // Handle unauthorized
  if (response.status === 401) {
    throw new SAMGovAPIError(
      'Invalid API key',
      401,
      'UNAUTHORIZED'
    );
  }

  // Handle forbidden
  if (response.status === 403) {
    console.error('SAM.gov API returned 403 Forbidden');
    console.error('API Key present:', !!SAM_API_KEY);
    console.error('API Key prefix:', SAM_API_KEY ? SAM_API_KEY.substring(0, 10) : 'UNDEFINED');
    throw new SAMGovAPIError(
      'Access forbidden. API key may be invalid, expired, or lack required permissions.',
      403,
      'FORBIDDEN'
    );
  }

  // Handle not found
  if (response.status === 404) {
    throw new SAMGovAPIError(
      'Resource not found',
      404,
      'NOT_FOUND'
    );
  }

  // Handle other errors
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new SAMGovAPIError(
      error.message || `API error: ${response.status}`,
      response.status,
      error.code,
      error
    );
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
