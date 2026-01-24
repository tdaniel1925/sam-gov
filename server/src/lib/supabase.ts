// =============================================================================
// SUPABASE CLIENT
// Following CodeBakers pattern 02-auth.md
// =============================================================================

import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  throw new Error('SUPABASE_URL environment variable is not set');
}

if (!SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_ANON_KEY environment variable is not set');
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY not set - admin operations will not work');
}

// Client for user operations (uses anon key)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin client for server-side operations (uses service role key)
export const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Helper to get user from JWT token
export async function getUserFromToken(token: string) {
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

// Helper to verify session
export async function verifySession(accessToken: string) {
  try {
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      return { valid: false, user: null };
    }

    return { valid: true, user: data.user };
  } catch (error) {
    return { valid: false, user: null };
  }
}
