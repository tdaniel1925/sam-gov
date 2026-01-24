// =============================================================================
// API CLIENT
// Following CodeBakers pattern 03-api.md
// =============================================================================

import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const errorMessage =
      (error.response?.data as any)?.error ||
      error.message ||
      'An unexpected error occurred';

    console.error('API Error:', errorMessage);
    throw new Error(errorMessage);
  }
);

export interface SearchParams {
  naicsCode?: string;
  postedFrom: string;
  postedTo: string;
  limit?: number;
  offset?: number;
}

export interface Opportunity {
  noticeId: string;
  title: string;
  solicitationNumber?: string;
  department?: string;
  postedDate?: string;
  responseDeadLine?: string;
  naicsCode?: string;
  type?: string;
  description?: string;
  pointOfContact?: Array<{
    email?: string;
    fullName?: string;
    phone?: string;
  }>;
  uiLink?: string;
}

export interface SearchResponse {
  totalRecords: number;
  limit: number;
  offset: number;
  opportunitiesData: Opportunity[];
}

export interface SavedOpportunity {
  id: string;
  noticeId: string;
  title: string;
  solicitationNumber?: string;
  department?: string;
  postedDate?: string;
  responseDeadline?: string;
  naicsCode?: string;
  opportunityData: any;
  notes?: string;
  savedAt: string;
}

export interface NotificationSubscription {
  id: string;
  email: string;
  naicsCode: string;
  frequency: 'daily' | 'weekly' | 'realtime';
  active: boolean;
  createdAt: string;
}

// Search API
export const searchAPI = {
  search: async (params: SearchParams) => {
    const response = await apiClient.post<{ data: SearchResponse; success: boolean }>(
      '/search',
      params
    );
    return response.data.data;
  },

  getRecent: async (naicsCode?: string, limit?: number) => {
    const response = await apiClient.get<{ data: SearchResponse; success: boolean }>(
      '/search/recent',
      {
        params: { naicsCode, limit },
      }
    );
    return response.data.data;
  },
};

// Saved Opportunities API
export const savedAPI = {
  getAll: async () => {
    const response = await apiClient.get<{ data: SavedOpportunity[]; success: boolean }>(
      '/saved'
    );
    return response.data.data;
  },

  save: async (opportunity: Opportunity) => {
    const response = await apiClient.post<{ data: SavedOpportunity; success: boolean }>(
      '/saved',
      {
        noticeId: opportunity.noticeId,
        title: opportunity.title,
        solicitationNumber: opportunity.solicitationNumber,
        department: opportunity.department,
        postedDate: opportunity.postedDate,
        responseDeadline: opportunity.responseDeadLine,
        naicsCode: opportunity.naicsCode,
        opportunityData: opportunity,
      }
    );
    return response.data.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<{ data: SavedOpportunity; success: boolean }>(
      `/saved/${id}`
    );
    return response.data.data;
  },

  updateNotes: async (id: string, notes: string) => {
    const response = await apiClient.patch<{ data: SavedOpportunity; success: boolean }>(
      `/saved/${id}`,
      { notes }
    );
    return response.data.data;
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: async (email: string) => {
    const response = await apiClient.get<{
      data: NotificationSubscription[];
      success: boolean;
    }>('/notifications', {
      params: { email },
    });
    return response.data.data;
  },

  subscribe: async (email: string, naicsCode: string, frequency: 'daily' | 'weekly' | 'realtime') => {
    const response = await apiClient.post<{
      data: NotificationSubscription;
      success: boolean;
    }>('/notifications', {
      email,
      naicsCode,
      frequency,
    });
    return response.data.data;
  },

  unsubscribe: async (id: string) => {
    const response = await apiClient.delete<{
      data: NotificationSubscription;
      success: boolean;
    }>(`/notifications/${id}`);
    return response.data.data;
  },

  update: async (id: string, data: { frequency?: string; active?: boolean }) => {
    const response = await apiClient.patch<{
      data: NotificationSubscription;
      success: boolean;
    }>(`/notifications/${id}`, data);
    return response.data.data;
  },
};

// Export API
export const exportAPI = {
  exportData: async (format: 'csv' | 'excel', opportunities: Opportunity[]) => {
    const response = await apiClient.post(
      '/export',
      { format, opportunities },
      { responseType: 'blob' }
    );

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `opportunities.${format === 'excel' ? 'xlsx' : 'csv'}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
