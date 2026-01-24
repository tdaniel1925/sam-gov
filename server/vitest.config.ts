// =============================================================================
// VITEST CONFIGURATION
// Following CodeBakers pattern 08-testing.md
// =============================================================================

import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';

// Load environment variables for tests
config({ path: '.env' });

export default defineConfig({
  test: {
    // Load environment variables
    env: {
      ...process.env,
      NODE_ENV: 'test',
    },
    // Test timeout
    testTimeout: 10000,
    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
    },
  },
});
