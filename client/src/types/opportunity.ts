export interface Opportunity {
  noticeId: string;
  title: string;
  solicitationNumber: string;
  department: string;
  postedDate: string;
  responseDeadline: string;
  naicsCode: string;
  description: string;
}

export interface SearchFilters {
  naicsCode?: string;
  dateFrom?: string;
  dateTo?: string;
  keyword?: string;
}