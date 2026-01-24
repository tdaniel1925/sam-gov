// =============================================================================
// COMPANY PROFILE PAGE
// Following CodeBakers pattern 04-frontend.md
// Form for company profile with NAICS codes, certifications, contact info
// =============================================================================

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { profileAPI } from '../lib/api';
import { toast } from 'sonner';

// Validation schema matching backend
const profileSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  ueiNumber: z.string().optional(),
  dunsNumber: z.string().optional(),
  cageCode: z.string().optional(),
  naicsCodes: z.array(z.string()).min(1, 'At least one NAICS code is required'),
  certifications: z.array(z.string()).optional(),
  primaryContact: z.object({
    name: z.string(),
    title: z.string(),
    email: z.string().email(),
    phone: z.string(),
  }).optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
  }).optional(),
  capabilities: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface CompanyProfile extends ProfileFormData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [existingProfile, setExistingProfile] = useState<CompanyProfile | null>(null);
  const [naicsInput, setNaicsInput] = useState('');
  const [certInput, setCertInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      naicsCodes: [],
      certifications: [],
    },
  });

  const naicsCodes = watch('naicsCodes') || [];
  const certifications = watch('certifications') || [];

  // Fetch existing profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsFetching(true);
    try {
      const response = await profileAPI.get();
      if (response.data.data) {
        const profile = response.data.data;
        setExistingProfile(profile);

        // Populate form with existing data
        setValue('companyName', profile.companyName);
        setValue('ueiNumber', profile.ueiNumber || '');
        setValue('dunsNumber', profile.dunsNumber || '');
        setValue('cageCode', profile.cageCode || '');
        setValue('naicsCodes', profile.naicsCodes || []);
        setValue('certifications', profile.certifications || []);
        setValue('capabilities', profile.capabilities || '');

        if (profile.primaryContact) {
          setValue('primaryContact', profile.primaryContact);
        }
        if (profile.address) {
          setValue('address', profile.address);
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response?.data
              ?.error
          : null;
      toast.error(errorMessage || 'Failed to load profile');
    } finally {
      setIsFetching(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      if (existingProfile) {
        // Update existing profile
        await profileAPI.update(existingProfile.id, data);
        toast.success('Profile updated successfully');
      } else {
        // Create new profile
        await profileAPI.create(data);
        toast.success('Profile created successfully');
      }
      navigate('/dashboard');
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response?.data
              ?.error
          : null;
      toast.error(errorMessage || 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const addNaicsCode = () => {
    if (naicsInput.trim() && !naicsCodes.includes(naicsInput.trim())) {
      setValue('naicsCodes', [...naicsCodes, naicsInput.trim()]);
      setNaicsInput('');
    }
  };

  const removeNaicsCode = (code: string) => {
    setValue('naicsCodes', naicsCodes.filter(c => c !== code));
  };

  const addCertification = () => {
    if (certInput.trim() && !certifications.includes(certInput.trim())) {
      setValue('certifications', [...certifications, certInput.trim()]);
      setCertInput('');
    }
  };

  const removeCertification = (cert: string) => {
    setValue('certifications', certifications.filter(c => c !== cert));
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {existingProfile ? 'Edit Company Profile' : 'Create Company Profile'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Complete your company profile to receive better opportunity matches
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('companyName')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="ueiNumber" className="block text-sm font-medium text-gray-700">
                  UEI Number
                </label>
                <input
                  {...register('ueiNumber')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="dunsNumber" className="block text-sm font-medium text-gray-700">
                  DUNS Number
                </label>
                <input
                  {...register('dunsNumber')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="cageCode" className="block text-sm font-medium text-gray-700">
                  CAGE Code
                </label>
                <input
                  {...register('cageCode')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* NAICS Codes */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              NAICS Codes <span className="text-red-500">*</span>
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Add the NAICS codes that represent your company's capabilities
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={naicsInput}
                onChange={(e) => setNaicsInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNaicsCode())}
                placeholder="Enter NAICS code (e.g., 541511)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={addNaicsCode}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {naicsCodes.map((code) => (
                <span
                  key={code}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {code}
                  <button
                    type="button"
                    onClick={() => removeNaicsCode(code)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {errors.naicsCodes && (
              <p className="mt-2 text-sm text-red-600">{errors.naicsCodes.message}</p>
            )}
          </div>

          {/* Certifications */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h2>
            <p className="text-sm text-gray-600 mb-4">
              Add your company's certifications (e.g., 8(a), HUBZone, WOSB, SDVOSB)
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                placeholder="Enter certification"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={addCertification}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {certifications.map((cert) => (
                <span
                  key={cert}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {cert}
                  <button
                    type="button"
                    onClick={() => removeCertification(cert)}
                    className="text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Capabilities</h2>
            <p className="text-sm text-gray-600 mb-4">
              Describe your company's key capabilities and expertise
            </p>
            <textarea
              {...register('capabilities')}
              rows={5}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your company's capabilities, expertise, and experience..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Link
              to="/dashboard"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : existingProfile ? 'Update Profile' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
