// =============================================================================
// SAM.GOV API TYPES
// Generated from SAM.gov API documentation and test responses
// =============================================================================

export interface OpportunitySearchParams {
  ncode?: string; // NAICS code (6 digits)
  postedFrom: string; // MM/DD/YYYY
  postedTo: string; // MM/DD/YYYY
  limit?: number; // Max 1000
  offset?: number; // Page offset
  ptype?: string; // Procurement type
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
