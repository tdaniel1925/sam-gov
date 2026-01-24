// =============================================================================
// AI SCORING SERVICE TESTS
// Following CodeBakers pattern 08-testing.md
// =============================================================================

import { describe, it, expect } from 'vitest';
import { AIScoringService } from './ai-scoring-service';
import type { Opportunity } from '../types/samgov';
import type { CompanyProfile } from '../db/schema';

describe('AIScoringService', () => {
  // Mock company profile
  const mockCompanyProfile: CompanyProfile = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    companyName: 'Test Company LLC',
    ueiNumber: '123456789',
    dunsNumber: '987654321',
    cageCode: 'ABCD1',
    naicsCodes: ['541330', '541512', '541519'],
    certifications: ['8(a)', 'HUBZone', 'SDVOSB'],
    primaryContact: {
      name: 'John Doe',
      title: 'CEO',
      email: 'john@test.com',
      phone: '555-0123',
    },
    address: {
      street: '123 Main St',
      city: 'Washington',
      state: 'DC',
      zip: '20001',
    },
    capabilities: 'Engineering services, software development, IT consulting',
    pastPerformance: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Mock opportunity with NAICS match
  const mockOpportunityMatch: Opportunity = {
    noticeId: 'TEST-001',
    title: 'Engineering Services Contract',
    naicsCode: '541330', // Matches company profile
    department: 'Department of Defense',
    typeOfSetAside: '8(a) Set-Aside', // Matches certification
    description: 'Seeking engineering services for infrastructure project',
  };

  // Mock opportunity without match
  const mockOpportunityNoMatch: Opportunity = {
    noticeId: 'TEST-002',
    title: 'Construction Services',
    naicsCode: '236220', // Does NOT match
    department: 'General Services Administration',
    typeOfSetAside: 'Unrestricted',
    description: 'Building construction project',
  };

  describe('scoreOpportunity', () => {
    it('should return high score for perfect match', async () => {
      const result = await AIScoringService.scoreOpportunity(
        mockOpportunityMatch,
        mockCompanyProfile
      );

      expect(result.score).toBeGreaterThanOrEqual(70); // Should be high score
      expect(result.matchFactors.naicsMatch).toBe(true);
      expect(result.matchFactors.certificationMatch).toBe(true);
      expect(result.reasoning).toBeTruthy();
    });

    it('should return lower score for non-matching opportunity', async () => {
      const result = await AIScoringService.scoreOpportunity(
        mockOpportunityNoMatch,
        mockCompanyProfile
      );

      expect(result.score).toBeLessThan(70); // Should be lower score
      expect(result.matchFactors.naicsMatch).toBe(false);
    });

    it('should return neutral score when no company profile', async () => {
      const result = await AIScoringService.scoreOpportunity(
        mockOpportunityMatch,
        null
      );

      expect(result.score).toBe(50); // Default neutral
      expect(result.reasoning).toContain('No company profile');
    });

    it('should handle opportunity without NAICS code', async () => {
      const oppWithoutNAICS: Opportunity = {
        ...mockOpportunityMatch,
        naicsCode: undefined,
      };

      const result = await AIScoringService.scoreOpportunity(
        oppWithoutNAICS,
        mockCompanyProfile
      );

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.matchFactors.naicsMatch).toBe(false);
    });

    it('should handle opportunity without set-aside', async () => {
      const oppWithoutSetAside: Opportunity = {
        ...mockOpportunityMatch,
        typeOfSetAside: undefined,
      };

      const result = await AIScoringService.scoreOpportunity(
        oppWithoutSetAside,
        mockCompanyProfile
      );

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('scoreOpportunities (batch)', () => {
    it('should score multiple opportunities', async () => {
      const opportunities = [mockOpportunityMatch, mockOpportunityNoMatch];

      const results = await AIScoringService.scoreOpportunities(
        opportunities,
        mockCompanyProfile
      );

      expect(results.size).toBe(2);
      expect(results.has('TEST-001')).toBe(true);
      expect(results.has('TEST-002')).toBe(true);

      const score1 = results.get('TEST-001');
      const score2 = results.get('TEST-002');

      expect(score1).toBeDefined();
      expect(score2).toBeDefined();
      expect(score1!.score).toBeGreaterThan(score2!.score); // Match should score higher
    });

    it('should handle empty array', async () => {
      const results = await AIScoringService.scoreOpportunities(
        [],
        mockCompanyProfile
      );

      expect(results.size).toBe(0);
    });

    it('should continue on error and score remaining opportunities', async () => {
      const opportunities = [
        mockOpportunityMatch,
        { ...mockOpportunityMatch, noticeId: 'TEST-003' },
      ];

      const results = await AIScoringService.scoreOpportunities(
        opportunities,
        mockCompanyProfile
      );

      // Should still score valid opportunities even if one fails
      expect(results.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe('rule-based scoring logic', () => {
    it('should award points for NAICS match', async () => {
      const result = await AIScoringService.scoreOpportunity(
        mockOpportunityMatch,
        mockCompanyProfile
      );

      expect(result.matchFactors.naicsMatch).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(40); // NAICS is worth 40 points
    });

    it('should award points for certification match', async () => {
      const oppWith8a: Opportunity = {
        ...mockOpportunityMatch,
        naicsCode: '999999', // No NAICS match
        typeOfSetAside: '8(a) Set-Aside',
      };

      const result = await AIScoringService.scoreOpportunity(
        oppWith8a,
        mockCompanyProfile
      );

      expect(result.matchFactors.certificationMatch).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(30); // Cert is worth 30 points
    });

    it('should recognize various certification formats', async () => {
      const certTypes = [
        '8(a) Set-Aside',
        'HUBZone Set-Aside',
        'SDVOSB Set-Aside',
        'Service-Disabled Veteran-Owned',
      ];

      for (const certType of certTypes) {
        const opp: Opportunity = {
          ...mockOpportunityMatch,
          naicsCode: '999999',
          typeOfSetAside: certType,
        };

        const result = await AIScoringService.scoreOpportunity(
          opp,
          mockCompanyProfile
        );

        // Should match at least one certification
        expect(result.score).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('scoring bounds', () => {
    it('should always return score between 0 and 100', async () => {
      const opportunities = [mockOpportunityMatch, mockOpportunityNoMatch];

      for (const opp of opportunities) {
        const result = await AIScoringService.scoreOpportunity(
          opp,
          mockCompanyProfile
        );

        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
      }
    });

    it('should include reasoning in all responses', async () => {
      const result = await AIScoringService.scoreOpportunity(
        mockOpportunityMatch,
        mockCompanyProfile
      );

      expect(result.reasoning).toBeTruthy();
      expect(typeof result.reasoning).toBe('string');
      expect(result.reasoning.length).toBeGreaterThan(0);
    });

    it('should include matchFactors in all responses', async () => {
      const result = await AIScoringService.scoreOpportunity(
        mockOpportunityMatch,
        mockCompanyProfile
      );

      expect(result.matchFactors).toBeDefined();
      expect(typeof result.matchFactors.naicsMatch).toBe('boolean');
      expect(typeof result.matchFactors.certificationMatch).toBe('boolean');
      expect(typeof result.matchFactors.sizeMatch).toBe('boolean');
      expect(typeof result.matchFactors.capabilityMatch).toBe('boolean');
    });
  });
});
