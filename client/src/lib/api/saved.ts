import { API_URL } from '../../config/api';

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

export const savedAPI = {
  // Get all saved opportunities
  async getAll(): Promise<SavedOpportunity[]> {
    const response = await fetch(`${API_URL}/saved`);
    if (!response.ok) {
      throw new Error('Failed to fetch saved opportunities');
    }
    const result = await response.json();
    return result.data;
  },

  // Save an opportunity
  async save(opportunity: any): Promise<SavedOpportunity> {
    const response = await fetch(`${API_URL}/saved`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        noticeId: opportunity.noticeId,
        title: opportunity.title,
        solicitationNumber: opportunity.solicitationNumber,
        department: opportunity.fullParentPathName,
        postedDate: opportunity.postedDate,
        responseDeadline: opportunity.responseDeadLine,
        naicsCode: opportunity.naicsCode,
        opportunityData: opportunity,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save opportunity');
    }

    const result = await response.json();
    return result.data;
  },

  // Delete a saved opportunity
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/saved/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete saved opportunity');
    }
  },

  // Update notes
  async updateNotes(id: string, notes: string): Promise<SavedOpportunity> {
    const response = await fetch(`${API_URL}/saved/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      throw new Error('Failed to update notes');
    }

    const result = await response.json();
    return result.data;
  },
};
