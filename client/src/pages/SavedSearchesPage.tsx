// =============================================================================
// SAVED SEARCH TEMPLATES PAGE
// Save and manage search query templates with alerts
// =============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Plus, Play, Edit, Trash2, Bell, BellOff, Search } from 'lucide-react';
import { toast } from 'sonner';

interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  searchParams: Record<string, string>;
  alertEnabled: boolean;
  alertFrequency: 'daily' | 'weekly' | 'realtime' | 'off';
  lastRun?: string;
  resultCount?: number;
  createdAt: string;
  updatedAt: string;
}

export default function SavedSearchesPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (session?.access_token) {
      loadSavedSearches();
    }
  }, [session]);

  const loadSavedSearches = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/saved-searches', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load saved searches');

      const data = await response.json();
      setSearches(data.data || []);
    } catch (error) {
      console.error('Load saved searches error:', error);
      toast.error('Failed to load saved searches');
    } finally {
      setLoading(false);
    }
  };

  const handleRunSearch = async (search: SavedSearch) => {
    try {
      setRunningId(search.id);
      const response = await fetch(`http://localhost:3001/api/saved-searches/${search.id}/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to run search');

      const data = await response.json();
      toast.success(`Found ${data.data.totalRecords} opportunities`);

      // Navigate to search results
      const params = new URLSearchParams(search.searchParams as any);
      navigate(`/advanced-search?${params.toString()}`);
    } catch (error) {
      console.error('Run search error:', error);
      toast.error('Failed to run search');
    } finally {
      setRunningId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved search?')) return;

    try {
      setDeletingId(id);
      const response = await fetch(`http://localhost:3001/api/saved-searches/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete search');

      setSearches(searches.filter(s => s.id !== id));
      toast.success('Saved search deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete search');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleAlert = async (search: SavedSearch) => {
    try {
      const response = await fetch(`http://localhost:3001/api/saved-searches/${search.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alertEnabled: !search.alertEnabled,
        }),
      });

      if (!response.ok) throw new Error('Failed to toggle alert');

      const data = await response.json();
      setSearches(searches.map(s => s.id === search.id ? data.data : s));
      toast.success(data.data.alertEnabled ? 'Alerts enabled' : 'Alerts disabled');
    } catch (error) {
      console.error('Toggle alert error:', error);
      toast.error('Failed to toggle alert');
    }
  };

  const getSearchParamsDisplay = (params: Record<string, string>) => {
    const entries = Object.entries(params).filter(([_, value]) => value);
    if (entries.length === 0) return 'All opportunities';

    return entries.map(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').trim();
      return `${label}: ${value}`;
    }).join(', ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Search Templates</h1>
        <p className="text-gray-600">Save complex search queries and reuse them with one click</p>
      </div>

      {/* Create Button */}
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate('/advanced-search?save=true')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Create New Search Template
        </button>

        <div className="text-sm text-gray-600">
          {searches.length} saved {searches.length === 1 ? 'search' : 'searches'}
        </div>
      </div>

      {/* Empty State */}
      {searches.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Saved Searches Yet</h3>
          <p className="text-gray-600 mb-6">
            Create search templates to quickly find opportunities that match your criteria
          </p>
          <button
            onClick={() => navigate('/advanced-search?save=true')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Create Your First Search
          </button>
        </div>
      ) : (
        /* Search Templates List */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {searches.map((search) => (
            <div
              key={search.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">
                    {search.name}
                  </h3>
                  <button
                    onClick={() => toggleAlert(search)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title={search.alertEnabled ? 'Disable alerts' : 'Enable alerts'}
                  >
                    {search.alertEnabled ? (
                      <Bell size={20} className="text-blue-600" />
                    ) : (
                      <BellOff size={20} />
                    )}
                  </button>
                </div>

                {search.description && (
                  <p className="text-sm text-gray-600 mb-3">{search.description}</p>
                )}

                <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                  {getSearchParamsDisplay(search.searchParams)}
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-gray-50 space-y-3">
                {/* Stats */}
                {search.lastRun && (
                  <div className="text-xs text-gray-600 flex items-center justify-between">
                    <span>Last run: {new Date(search.lastRun).toLocaleDateString()}</span>
                    {search.resultCount !== undefined && (
                      <span className="font-medium">{search.resultCount} results</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRunSearch(search)}
                    disabled={runningId === search.id}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300"
                  >
                    {runningId === search.id ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        Run
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => navigate(`/advanced-search?template=${search.id}`)}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(search.id)}
                    disabled={deletingId === search.id}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingId === search.id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click the bell icon to enable email alerts for new opportunities</li>
          <li>• Use the Run button to execute the search and see current results</li>
          <li>• Edit templates to refine your search criteria over time</li>
        </ul>
      </div>
    </div>
  );
}
