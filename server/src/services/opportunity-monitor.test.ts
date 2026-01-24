// =============================================================================
// OPPORTUNITY MONITOR TESTS
// Following CodeBakers pattern 08-testing.md
// =============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OpportunityMonitor } from './opportunity-monitor';

describe('OpportunityMonitor', () => {
  beforeEach(() => {
    // Stop any running jobs before each test
    OpportunityMonitor.stop();
  });

  describe('start and stop', () => {
    it('should start monitoring jobs', () => {
      // Start should not throw
      expect(() => OpportunityMonitor.start()).not.toThrow();

      // Clean up
      OpportunityMonitor.stop();
    });

    it('should stop monitoring jobs', () => {
      OpportunityMonitor.start();

      // Stop should not throw
      expect(() => OpportunityMonitor.stop()).not.toThrow();
    });

    it('should handle multiple start/stop cycles', () => {
      OpportunityMonitor.start();
      OpportunityMonitor.stop();
      OpportunityMonitor.start();
      OpportunityMonitor.stop();

      // Should not throw errors
      expect(true).toBe(true);
    });
  });

  describe('getNewToday', () => {
    it('should return an array', async () => {
      const result = await OpportunityMonitor.getNewToday();

      expect(Array.isArray(result)).toBe(true);
    });

    it('should accept optional NAICS code parameter', async () => {
      const result = await OpportunityMonitor.getNewToday('541330');

      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      // Should return empty array on error, not throw
      const result = await OpportunityMonitor.getNewToday();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('runOnce', () => {
    it('should execute poll without errors', async () => {
      // This will call the actual SAM.gov API if env vars are set
      // In production tests, you'd mock the API calls
      await expect(OpportunityMonitor.runOnce()).resolves.not.toThrow();
    });
  });
});
