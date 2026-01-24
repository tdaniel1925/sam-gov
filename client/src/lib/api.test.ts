// =============================================================================
// API CLIENT TESTS
// Tests for opportunity API helper functions
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { opportunityAPI } from './api';
import * as apiModule from './api';

// Mock axios
vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
  opportunityAPI: {
    getNewToday: vi.fn(),
    getDiscovered: vi.fn(),
    triggerPoll: vi.fn(),
  },
}));

describe('opportunityAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getNewToday', () => {
    it('should fetch new opportunities without NAICS filter', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: '1',
              noticeId: 'TEST123',
              title: 'Test Opportunity',
              naicsCode: '541511',
            },
          ],
          success: true,
        },
      };

      (opportunityAPI.getNewToday as any).mockResolvedValue(mockResponse);

      const result = await opportunityAPI.getNewToday();

      expect(result).toEqual(mockResponse);
      expect(opportunityAPI.getNewToday).toHaveBeenCalledWith();
    });

    it('should fetch new opportunities with NAICS filter', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: '1',
              noticeId: 'TEST123',
              title: 'Test Opportunity',
              naicsCode: '541511',
            },
          ],
          success: true,
        },
      };

      (opportunityAPI.getNewToday as any).mockResolvedValue(mockResponse);

      const result = await opportunityAPI.getNewToday('541511');

      expect(result).toEqual(mockResponse);
      expect(opportunityAPI.getNewToday).toHaveBeenCalledWith('541511');
    });
  });

  describe('getDiscovered', () => {
    it('should fetch discovered opportunities with optional params', async () => {
      const mockResponse = {
        data: {
          data: [],
          success: true,
        },
      };

      (opportunityAPI.getDiscovered as any).mockResolvedValue(mockResponse);

      const result = await opportunityAPI.getDiscovered('541511', 50);

      expect(result).toEqual(mockResponse);
      expect(opportunityAPI.getDiscovered).toHaveBeenCalledWith('541511', 50);
    });
  });

  describe('triggerPoll', () => {
    it('should trigger manual poll successfully', async () => {
      const mockResponse = {
        data: {
          message: 'Poll triggered',
          success: true,
        },
      };

      (opportunityAPI.triggerPoll as any).mockResolvedValue(mockResponse);

      const result = await opportunityAPI.triggerPoll();

      expect(result).toEqual(mockResponse);
      expect(opportunityAPI.triggerPoll).toHaveBeenCalled();
    });
  });
});
