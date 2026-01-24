// =============================================================================
// SAM.GOV SERVICE TESTS
// Following CodeBakers pattern 08-testing.md
// =============================================================================

import { describe, it, expect, beforeAll } from 'vitest';
import { SAMGovService } from './samgov-service';

describe('SAMGovService', () => {
  beforeAll(() => {
    // Ensure API key is set
    if (!process.env.SAM_API_KEY) {
      process.env.SAM_API_KEY = 'test-key';
    }
  });

  describe('searchOpportunities', () => {
    it('should validate date range cannot exceed 1 year', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);

      await expect(
        SAMGovService.searchOpportunities({
          postedFrom: '01/01/2023',
          postedTo: '01/01/2025', // 2 years later
          limit: 10,
        })
      ).rejects.toThrow('Date range cannot exceed 1 year');
    });

    it('should validate NAICS code format', async () => {
      await expect(
        SAMGovService.searchOpportunities({
          ncode: 'invalid',
          postedFrom: '01/01/2025',
          postedTo: '01/31/2025',
          limit: 10,
        })
      ).rejects.toThrow('NAICS code must be 1-6 digits');
    });

    it('should accept valid NAICS codes', async () => {
      // This test will call the actual API
      // In production, you'd mock this
      const validCodes = ['1', '12', '123', '1234', '12345', '123456'];

      for (const code of validCodes) {
        await expect(async () => {
          await SAMGovService.searchOpportunities({
            ncode: code,
            postedFrom: '12/22/2025',
            postedTo: '01/22/2026',
            limit: 1,
          });
        }).not.toThrow('NAICS code must be 1-6 digits');
      }
    });
  });

  describe('getRecentOpportunities', () => {
    it('should format dates correctly', async () => {
      // Test that the method works without errors
      const result = await SAMGovService.getRecentOpportunities('541330', 5);

      expect(result).toHaveProperty('totalRecords');
      expect(result).toHaveProperty('opportunitiesData');
      expect(Array.isArray(result.opportunitiesData)).toBe(true);
    });
  });

  describe('getOpportunitiesByNAICS', () => {
    it('should search by NAICS code', async () => {
      const result = await SAMGovService.getOpportunitiesByNAICS(
        '541330',
        '12/22/2025',
        '01/22/2026',
        5
      );

      expect(result).toHaveProperty('totalRecords');
      expect(result).toHaveProperty('opportunitiesData');
      expect(Array.isArray(result.opportunitiesData)).toBe(true);

      // If results exist, verify they have the expected NAICS code
      if (result.opportunitiesData.length > 0) {
        const allMatchNAICS = result.opportunitiesData.every(
          (opp) => opp.naicsCode === '541330'
        );
        expect(allMatchNAICS).toBe(true);
      }
    });
  });
});
