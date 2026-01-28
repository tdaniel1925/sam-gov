// =============================================================================
// SAM.GOV API TYPES
// Generated from SAM.gov API documentation and test responses
// =============================================================================

export interface OpportunitySearchParams {
  // Date filters (postedFrom is mandatory per SAM.gov API)
  postedFrom: string; // MM/DD/YYYY (mandatory)
  postedTo: string; // MM/DD/YYYY (mandatory)

  // Core filters
  ncode?: string; // NAICS code (6 digits)
  ptype?: string; // Procurement type (e.g., 'o' for solicitation, 'p' for presolicitation)

  // Advanced filters from requirements
  solicitationNumber?: string; // Solicitation number
  noticeId?: string; // Notice ID
  state?: string; // State code (e.g., 'TX')
  zip?: string; // Zip code
  organizationName?: string; // Organization/agency name
  setAside?: string; // Set-aside code (e.g., 'SBA', 'WOSB', 'SDVOSB')
  classificationCode?: string; // Product Service Code (PSC)
  responseDeadlineFrom?: string; // MM/DD/YYYY
  responseDeadlineTo?: string; // MM/DD/YYYY

  // Pagination
  limit?: number; // Max 1000, default 10
  offset?: number; // Page offset for pagination

  // Keywords (full-text search)
  keywords?: string; // Free-text keyword search
}

export interface Opportunity {
  noticeId: string;
  title: string;
  solicitationNumber?: string;
  department?: string;
  subTier?: string;
  office?: string;
  postedDate?: string;
  type?: string;
  baseType?: string;
  archiveType?: string;
  archiveDate?: string;
  typeOfSetAsideDescription?: string;
  typeOfSetAside?: string;
  responseDeadLine?: string;
  naicsCode?: string;
  classificationCode?: string;
  active?: string;
  award?: {
    date?: string;
    number?: string;
    amount?: string;
    awardee?: {
      name?: string;
      location?: string;
      ueiSAM?: string;
      duns?: string;
    };
  };
  pointOfContact?: Array<{
    fax?: string;
    type?: string;
    email?: string;
    phone?: string;
    title?: string;
    fullName?: string;
  }>;
  description?: string;
  organizationType?: string;
  officeAddress?: {
    zipcode?: string;
    city?: string;
    countryCode?: string;
    state?: string;
  };
  placeOfPerformance?: {
    streetAddress?: string;
    city?: {
      code?: string;
      name?: string;
    };
    state?: {
      code?: string;
      name?: string;
    };
    zip?: string;
    country?: {
      code?: string;
      name?: string;
    };
  };
  additionalInfoLink?: string;
  uiLink?: string;
  links?: Array<{
    rel?: string;
    href?: string;
  }>;
  resourceLinks?: string[];
}

export interface OpportunitySearchResponse {
  totalRecords: number;
  limit: number;
  offset: number;
  opportunitiesData: Opportunity[];
  links: Array<{
    rel: string;
    href: string;
  }>;
}
