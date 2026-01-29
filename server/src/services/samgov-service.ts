// =============================================================================
// SAM.GOV SERVICE
// Following CodeBakers pattern 06f-api-patterns.md
// =============================================================================

import { samRequest, SAMGovAPIError } from '../lib/samgov-client';
import type {
  OpportunitySearchParams,
  OpportunitySearchResponse,
} from '../types/samgov';
import cachedData from '../data/cached-opportunities.json';

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

    // Build query parameters (only include non-empty values)
    const queryParams: Record<string, string> = {
      postedFrom: params.postedFrom,
      postedTo: params.postedTo,
      limit: String(params.limit || 20),
      offset: String(params.offset || 0),
    };

    // NAICS code filter
    if (params.ncode) {
      if (!/^\d{1,6}$/.test(params.ncode)) {
        throw new Error('NAICS code must be 1-6 digits');
      }
      queryParams.ncode = params.ncode;
    }

    // Procurement type (o=solicitation, p=presolicitation, etc.)
    if (params.ptype) {
      queryParams.ptype = params.ptype;
    }

    // Solicitation number
    if (params.solicitationNumber) {
      queryParams.solnum = params.solicitationNumber;
    }

    // Notice ID
    if (params.noticeId) {
      queryParams.noticeid = params.noticeId;
    }

    // Location filters
    if (params.state) {
      queryParams.state = params.state.toUpperCase();
    }

    if (params.zip) {
      queryParams.zip = params.zip;
    }

    // Organization/agency name
    if (params.organizationName) {
      queryParams.orgname = params.organizationName;
    }

    // Set-aside code (SBA, WOSB, SDVOSB, etc.)
    if (params.setAside) {
      queryParams.typeOfSetAside = params.setAside;
    }

    // Classification code (PSC)
    if (params.classificationCode) {
      queryParams.psc = params.classificationCode;
    }

    // Response deadline range
    if (params.responseDeadlineFrom) {
      queryParams.rdlfrom = params.responseDeadlineFrom;
    }

    if (params.responseDeadlineTo) {
      queryParams.rdlto = params.responseDeadlineTo;
    }

    // Keywords (full-text search)
    if (params.keywords) {
      queryParams.q = params.keywords;
    }

    try {
      return await samRequest<OpportunitySearchResponse>('/search', {
        params: queryParams,
      });
    } catch (error) {
      // If SAM.gov blocks us (403 or 429), fall back to cached data
      if (error instanceof SAMGovAPIError && (error.statusCode === 403 || error.statusCode === 429)) {
        const reason = error.statusCode === 403 ? 'Forbidden (IP blocked)' : 'Rate limit exceeded';
        console.log(`⚠️  SAM.gov API error (${error.statusCode} ${reason}) - using cached data as fallback`);
        return {
          totalRecords: cachedData.totalRecords,
          limit: params.limit || 20,
          offset: params.offset || 0,
          opportunitiesData: cachedData.opportunities.slice(
            params.offset || 0,
            (params.offset || 0) + (params.limit || 20)
          ),
        };
      }
      throw error;
    }
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
