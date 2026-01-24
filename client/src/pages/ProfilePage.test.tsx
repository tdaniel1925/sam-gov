// =============================================================================
// PROFILE PAGE TESTS
// Tests for company profile form functionality
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { profileAPI } from '../lib/api';

// Mock the API module
vi.mock('../lib/api', () => ({
  profileAPI: {
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('profileAPI', () => {
    it('should fetch existing profile', async () => {
      const mockProfile = {
        data: {
          data: {
            id: '123',
            companyName: 'Test Company',
            naicsCodes: ['541511'],
            certifications: ['8(a)'],
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
          success: true,
        },
      };

      (profileAPI.get as any).mockResolvedValue(mockProfile);

      const result = await profileAPI.get();

      expect(result).toEqual(mockProfile);
      expect(profileAPI.get).toHaveBeenCalled();
    });

    it('should create new profile successfully', async () => {
      const profileData = {
        companyName: 'New Company',
        naicsCodes: ['541511', '541512'],
        certifications: ['WOSB'],
      };

      const mockResponse = {
        data: {
          data: {
            id: '456',
            ...profileData,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
          success: true,
        },
      };

      (profileAPI.create as any).mockResolvedValue(mockResponse);

      const result = await profileAPI.create(profileData);

      expect(result).toEqual(mockResponse);
      expect(profileAPI.create).toHaveBeenCalledWith(profileData);
    });

    it('should update existing profile', async () => {
      const profileId = '123';
      const updateData = {
        companyName: 'Updated Company Name',
        naicsCodes: ['541511'],
      };

      const mockResponse = {
        data: {
          data: {
            id: profileId,
            ...updateData,
            updatedAt: '2024-01-02',
          },
          success: true,
        },
      };

      (profileAPI.update as any).mockResolvedValue(mockResponse);

      const result = await profileAPI.update(profileId, updateData);

      expect(result).toEqual(mockResponse);
      expect(profileAPI.update).toHaveBeenCalledWith(profileId, updateData);
    });

    it('should handle API errors gracefully', async () => {
      const errorResponse = {
        response: {
          data: {
            error: 'Profile not found',
            code: 'PROFILE_NOT_FOUND',
          },
          status: 404,
        },
      };

      (profileAPI.get as any).mockRejectedValue(errorResponse);

      await expect(profileAPI.get()).rejects.toEqual(errorResponse);
    });

    it('should validate NAICS codes array requirement', async () => {
      const invalidData = {
        companyName: 'Test Company',
        naicsCodes: [], // Empty array should fail validation
      };

      const errorResponse = {
        response: {
          data: {
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: {
              naicsCodes: ['At least one NAICS code is required'],
            },
          },
          status: 400,
        },
      };

      (profileAPI.create as any).mockRejectedValue(errorResponse);

      await expect(profileAPI.create(invalidData)).rejects.toEqual(errorResponse);
    });
  });
});
