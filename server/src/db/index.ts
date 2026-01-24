// =============================================================================
// DATABASE CONNECTION
// Following CodeBakers pattern 01-database.md
// =============================================================================

// Load environment variables if not already loaded
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Connection pool for server-side (optimized for Supabase)
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: 'require', // Required for Supabase
});

export const db = drizzle(client, { schema });

// Types
export type DbClient = typeof db;
