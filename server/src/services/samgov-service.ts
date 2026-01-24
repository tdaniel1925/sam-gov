// =============================================================================
// SAM.GOV SERVICE
// Following CodeBakers pattern 06f-api-patterns.md
// =============================================================================

import { samRequest } from '../lib/samgov-client';
import type {
  OpportunitySearchParams,
  OpportunitySearchResponse,
} from '../types/samgov';

export class SAMGovService {
  /**
   * Search for contracting opportunities
   */
  static async searchOpportunities(
    params: OpportunitySearchParams
  ): Promise<OpportunitySearchResponse> {
    // Validate date range (max 1 year per API requirements)
    const fromDate = new Date(params.postedFrom);
    const toDate = new Date(params.postedTo);
    const daysDiff = Math.abs(toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff > 365) {
      throw new Error('Date range cannot exceed 1 year');
    }

    // Build query parameters
    const queryParams: Record<string, string> = {
      postedFrom: params.postedFrom,
      postedTo: params.postedTo,
      limit: String(params.limit || 20),
      offset: String(params.offset || 0),
    };

    if (params.ncode) {
      // Validate NAICS code (max 6 digits)
      if (!/^\d{1,6}$/.test(params.ncode)) {
        throw new Error('NAICS code must be 1-6 digits');
      }
      queryParams.ncode = params.ncode;
    }

    if (params.ptype) {
      queryParams.ptype = params.ptype;
    }

    return samRequest<OpportunitySearchResponse>('/search', {
      params: queryParams,
    });
  }

  /**
   * Get opportunities for a specific NAICS code
   */
  static async getOpportunitiesByNAICS(
    naicsCode: string,
    startDate: string,
    endDate: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<OpportunitySearchResponse> {
    return this.searchOpportunities({
      ncode: naicsCode,
      postedFrom: startDate,
      postedTo: endDate,
      limit,
      offset,
    });
  }

  /**
   * Get recent opportunities (last 30 days)
   */
  static async getRecentOpportunities(
    naicsCode?: string,
    limit: number = 20
  ): Promise<OpportunitySearchResponse> {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const formatDate = (date: Date): string => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };

    return this.searchOpportunities({
      ncode: naicsCode,
      postedFrom: formatDate(thirtyDaysAgo),
      postedTo: formatDate(today),
      limit,
      offset: 0,
    });
  }
}
