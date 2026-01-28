// =============================================================================
// ADVANCED SEARCH PAGE
// Full-featured search with all SAM.gov filters + AI enhancements
// =============================================================================

import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface SearchFilters {
  postedFrom: string;
  postedTo: string;
  naicsCode?: string;
  procurementType?: string;
  state?: string;
  setAside?: string;
  keywords?: string;
  organizationName?: string;
  classificationCode?: string;
  withAI: boolean;
}

export default function AdvancedSearchPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Date range presets
  const [datePreset, setDatePreset] = useState('30');

  const [filters, setFilters] = useState<SearchFilters>({
    postedFrom: getDateString(30), // Last 30 days
    postedTo: getDateString(0), // Today
    withAI: true, // AI enabled by default
  });

  function getDateString(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  }

  function formatDateForAPI(dateStr: string): string {
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  function handleDatePresetChange(days: string) {
    setDatePreset(days);
    const daysNum = parseInt(days);
    setFilters({
      ...filters,
      postedFrom: getDateString(daysNum),
      postedTo: getDateString(0),
    });
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const searchParams: any = {
        postedFrom: formatDateForAPI(filters.postedFrom),
        postedTo: formatDateForAPI(filters.postedTo),
        withAI: filters.withAI,
      };

      // Add optional filters
      if (filters.naicsCode) searchParams.naicsCode = filters.naicsCode;
      if (filters.procurementType) searchParams.procurementType = filters.procurementType;
      if (filters.state) searchParams.state = filters.state;
      if (filters.setAside) searchParams.setAside = filters.setAside;
      if (filters.keywords) searchParams.keywords = filters.keywords;
      if (filters.organizationName) searchParams.organizationName = filters.organizationName;
      if (filters.classificationCode) searchParams.classificationCode = filters.classificationCode;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setResults(data.data);

      toast.success(`Found ${data.data.totalRecords} opportunities`);

    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function viewOpportunityDetail(opportunity: any) {
    // Navigate to detail page with opportunity data
    navigate('/opportunity-detail', { state: { opportunity } });
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Advanced Opportunity Search</h1>
          <p className="mt-2 text-gray-600">Search SAM.gov with advanced filters and AI-powered insights</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posted Date Range
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Quick Select</label>
                  <select
                    value={datePreset}
                    onChange={(e) => handleDatePresetChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="custom">Custom range</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">From</label>
                  <input
                    type="date"
                    value={filters.postedFrom}
                    onChange={(e) => setFilters({ ...filters, postedFrom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">To</label>
                  <input
                    type="date"
                    value={filters.postedTo}
                    onChange={(e) => setFilters({ ...filters, postedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Core Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NAICS Code
                </label>
                <input
                  type="text"
                  placeholder="e.g., 541330"
                  value={filters.naicsCode || ''}
                  onChange={(e) => setFilters({ ...filters, naicsCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords
                </label>
                <input
                  type="text"
                  placeholder="Search keywords..."
                  value={filters.keywords || ''}
                  onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set-Aside
                </label>
                <select
                  value={filters.setAside || ''}
                  onChange={(e) => setFilters({ ...filters, setAside: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="SBA">Small Business</option>
                  <option value="WOSB">Women-Owned Small Business</option>
                  <option value="SDVOSB">Service-Disabled Veteran-Owned</option>
                  <option value="8A">8(a) Business Development</option>
                  <option value="HUBZone">HUBZone</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  placeholder="e.g., TX"
                  maxLength={2}
                  value={filters.state || ''}
                  onChange={(e) => setFilters({ ...filters, state: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Procurement Type
                </label>
                <select
                  value={filters.procurementType || ''}
                  onChange={(e) => setFilters({ ...filters, procurementType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="o">Solicitation</option>
                  <option value="p">Presolicitation</option>
                  <option value="a">Award Notice</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization/Agency Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Department of Defense"
                  value={filters.organizationName || ''}
                  onChange={(e) => setFilters({ ...filters, organizationName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PSC Code (Classification)
                </label>
                <input
                  type="text"
                  placeholder="Product/Service Code"
                  value={filters.classificationCode || ''}
                  onChange={(e) => setFilters({ ...filters, classificationCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* AI Toggle */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🤖</span>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">AI-Powered Analysis</h3>
                    <p className="text-xs text-gray-600">Score and summarize opportunities automatically</p>
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.withAI}
                  onChange={(e) => setFilters({ ...filters, withAI: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Searching...' : '🔍 Search Opportunities'}
            </button>
          </form>
        </div>

        {/* Results */}
        {results && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Results ({results.totalRecords})
              </h2>
              {results.aiEnhanced && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  🤖 AI Enhanced
                </span>
              )}
            </div>

            <div className="space-y-4">
              {results.opportunitiesData?.map((opp: any) => (
                <div
                  key={opp.noticeId}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => viewOpportunityDetail(opp)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {opp.title}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Agency:</span> {opp.department || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">NAICS:</span> {opp.naicsCode || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Posted:</span> {opp.postedDate || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Deadline:</span> {opp.responseDeadLine || 'N/A'}
                        </div>
                      </div>

                      {/* AI Score if available */}
                      {opp.aiScore && (
                        <div className="mt-3 flex items-center space-x-4">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-700">Match Score:</span>
                            <div className="ml-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                              {opp.aiScore.score}/100
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{opp.aiScore.reasoning}</p>
                        </div>
                      )}
                    </div>
                    <button className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
