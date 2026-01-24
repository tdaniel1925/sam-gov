// =============================================================================
// SEARCH PAGE
// Following CodeBakers pattern 04-frontend.md
// =============================================================================

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Search, Bookmark, Download, ExternalLink, Loader2 } from 'lucide-react';
import { searchAPI, savedAPI, exportAPI, type Opportunity } from '../services/api';
import { format } from 'date-fns';

const searchSchema = z.object({
  naicsCode: z.string().regex(/^\d{1,6}$/, 'NAICS code must be 1-6 digits').optional().or(z.literal('')),
  postedFrom: z.string().min(1, 'Start date is required'),
  postedTo: z.string().min(1, 'End date is required'),
});

type SearchFormData = z.infer<typeof searchSchema>;

export default function SearchPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [savingId, setSavingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      naicsCode: '',
      postedFrom: '',
      postedTo: '',
    },
  });

  // Set date presets
  const setDatePreset = (days: number) => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - days);

    setValue('postedFrom', format(pastDate, 'MM/dd/yyyy'));
    setValue('postedTo', format(today, 'MM/dd/yyyy'));
  };

  const onSubmit = async (data: SearchFormData) => {
    setIsSearching(true);
    try {
      const result = await searchAPI.search({
        naicsCode: data.naicsCode || undefined,
        postedFrom: data.postedFrom,
        postedTo: data.postedTo,
        limit: 50,
      });

      setOpportunities(result.opportunitiesData);
      setTotalRecords(result.totalRecords);
      toast.success(`Found ${result.totalRecords} opportunities`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search failed';
      toast.error(message);
      setOpportunities([]);
      setTotalRecords(0);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = async (opportunity: Opportunity) => {
    setSavingId(opportunity.noticeId);
    try {
      await savedAPI.save(opportunity);
      toast.success('Opportunity saved!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save';
      toast.error(message);
    } finally {
      setSavingId(null);
    }
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      await exportAPI.exportData(format, opportunities);
      toast.success(`Exported to ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Search Contracting Opportunities</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* NAICS Code */}
          <div>
            <label htmlFor="naicsCode" className="block text-sm font-medium text-gray-700 mb-2">
              NAICS Code (Optional)
            </label>
            <input
              {...register('naicsCode')}
              type="text"
              id="naicsCode"
              placeholder="e.g., 541330"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.naicsCode && (
              <p className="mt-1 text-sm text-red-600">{errors.naicsCode.message}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="postedFrom" className="block text-sm font-medium text-gray-700 mb-2">
                Posted From (MM/DD/YYYY)
              </label>
              <input
                {...register('postedFrom')}
                type="text"
                id="postedFrom"
                placeholder="12/22/2025"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.postedFrom && (
                <p className="mt-1 text-sm text-red-600">{errors.postedFrom.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="postedTo" className="block text-sm font-medium text-gray-700 mb-2">
                Posted To (MM/DD/YYYY)
              </label>
              <input
                {...register('postedTo')}
                type="text"
                id="postedTo"
                placeholder="01/22/2026"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.postedTo && (
                <p className="mt-1 text-sm text-red-600">{errors.postedTo.message}</p>
              )}
            </div>
          </div>

          {/* Date Presets */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDatePreset(7)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Last 7 days
            </button>
            <button
              type="button"
              onClick={() => setDatePreset(30)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Last 30 days
            </button>
            <button
              type="button"
              onClick={() => setDatePreset(90)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Last 90 days
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSearching}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSearching ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Searching...
              </>
            ) : (
              <>
                <Search size={20} />
                Search Opportunities
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results */}
      {opportunities.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">
              Results ({totalRecords.toLocaleString()})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('csv')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                CSV
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Excel
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {opportunities.map((opp) => (
              <div
                key={opp.noticeId}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-blue-600 mb-2">{opp.title}</h4>

                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      {opp.solicitationNumber && (
                        <p>
                          <span className="font-medium">Solicitation:</span> {opp.solicitationNumber}
                        </p>
                      )}
                      {opp.department && (
                        <p>
                          <span className="font-medium">Department:</span> {opp.department}
                        </p>
                      )}
                      {opp.postedDate && (
                        <p>
                          <span className="font-medium">Posted:</span> {opp.postedDate}
                        </p>
                      )}
                      {opp.responseDeadLine && (
                        <p>
                          <span className="font-medium">Deadline:</span> {opp.responseDeadLine}
                        </p>
                      )}
                      {opp.naicsCode && (
                        <p>
                          <span className="font-medium">NAICS:</span> {opp.naicsCode}
                        </p>
                      )}
                      {opp.type && (
                        <p>
                          <span className="font-medium">Type:</span> {opp.type}
                        </p>
                      )}
                    </div>

                    {opp.pointOfContact && opp.pointOfContact[0]?.email && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Contact:</span> {opp.pointOfContact[0].email}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleSave(opp)}
                      disabled={savingId === opp.noticeId}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                    >
                      {savingId === opp.noticeId ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Bookmark size={16} />
                      )}
                      Save
                    </button>
                    {opp.uiLink && (
                      <a
                        href={opp.uiLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 text-center"
                      >
                        <ExternalLink size={16} />
                        View
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isSearching && opportunities.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Search size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No results yet
          </h3>
          <p className="text-gray-500">
            Enter your search criteria and click "Search Opportunities" to find contracting opportunities.
          </p>
        </div>
      )}
    </div>
  );
}
