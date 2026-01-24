// =============================================================================
// API CLIENT
// Following CodeBakers pattern 03-api.md + 04-frontend.md
// Axios client with Supabase auth integration
// =============================================================================

import axios from 'axios';
import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3050';

// Create axios instance
export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - sign out user
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// API Helper Functions
export const authAPI = {
  me: () => api.get('/auth/me'),
};

export const subscriptionAPI = {
  getCurrent: () => api.get('/subscriptions/current'),
  createCheckout: (data: { plan: string; interval: string; teamId: string }) =>
    api.post('/subscriptions/checkout', data),
  createPortal: () => api.post('/subscriptions/portal'),
  update: (data: { plan: string; interval: string }) =>
    api.put('/subscriptions/update', data),
  cancel: (data: { cancelAtPeriodEnd: boolean }) =>
    api.post('/subscriptions/cancel', data),
};

export const opportunityAPI = {
  search: (params: any) => api.get('/search', { params }),
  getSaved: () => api.get('/saved'),
  save: (opportunityId: string) => api.post('/saved', { opportunityId }),
  remove: (opportunityId: string) => api.delete(`/saved/${opportunityId}`),
  getNewToday: (naicsCode?: string) =>
    api.get('/opportunities/new', { params: naicsCode ? { naicsCode } : {} }),
  getDiscovered: (naicsCode?: string, limit?: number) =>
    api.get('/opportunities/discovered', { params: { naicsCode, limit } }),
  triggerPoll: () => api.post('/opportunities/poll'),
  score: (opportunity: any) => api.post('/opportunities/score', { opportunity }),
};

export const profileAPI = {
  get: () => api.get('/profile'),
  create: (data: any) => api.post('/profile', data),
  update: (id: string, data: any) => api.put(`/profile/${id}`, data),
  delete: (id: string) => api.delete(`/profile/${id}`),
};
