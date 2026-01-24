// =============================================================================
// SAVED OPPORTUNITIES PAGE
// Following CodeBakers pattern 04-frontend.md
// =============================================================================

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Bookmark, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { savedAPI, type SavedOpportunity } from '../services/api';

export default function SavedPage() {
  const [saved, setSaved] = useState<SavedOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadSaved();
  }, []);

  const loadSaved = async () => {
    setIsLoading(true);
    try {
      const data = await savedAPI.getAll();
      setSaved(data);
    } catch (error) {
      toast.error('Failed to load saved opportunities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await savedAPI.delete(id);
      setSaved(saved.filter((item) => item.id !== id));
      toast.success('Opportunity removed');
    } catch (error) {
      toast.error('Failed to remove opportunity');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bookmark className="text-yellow-500" size={28} />
            Saved Opportunities ({saved.length})
          </h2>
        </div>

        {saved.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No saved opportunities
            </h3>
            <p className="text-gray-500">
              Save opportunities from the search page to access them later.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {saved.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-blue-600 mb-2">
                      {item.title}
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      <p>
                        <span className="font-medium">Notice ID:</span> {item.noticeId}
                      </p>
                      {item.solicitationNumber && (
                        <p>
                          <span className="font-medium">Solicitation:</span>{' '}
                          {item.solicitationNumber}
                        </p>
                      )}
                      {item.department && (
                        <p>
                          <span className="font-medium">Department:</span> {item.department}
                        </p>
                      )}
                      {item.postedDate && (
                        <p>
                          <span className="font-medium">Posted:</span> {item.postedDate}
                        </p>
                      )}
                      {item.responseDeadline && (
                        <p>
                          <span className="font-medium">Deadline:</span>{' '}
                          {item.responseDeadline}
                        </p>
                      )}
                      {item.naicsCode && (
                        <p>
                          <span className="font-medium">NAICS:</span> {item.naicsCode}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-gray-500">
                      Saved: {new Date(item.savedAt).toLocaleString()}
                    </p>

                    {item.notes && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                        <p className="text-sm text-gray-600">{item.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {item.opportunityData?.uiLink && (
                      <a
                        href={item.opportunityData.uiLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                      >
                        <ExternalLink size={16} />
                        View
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
