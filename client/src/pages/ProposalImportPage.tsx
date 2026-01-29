// =============================================================================
// SAM.GOV IMPORT PAGE
// Import opportunities directly from SAM.gov to create proposals
// =============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PreviewData {
  title: string;
  solicitationNumber: string;
  agencyName: string;
  dueDate: string;
  naicsCode: string;
  setAside: string;
  extractedRequirementsCount: number;
  requirements: Array<{
    text: string;
    type: 'mandatory' | 'desired' | 'optional';
  }>;
}

export default function ProposalImportPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [noticeId, setNoticeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePreview = async () => {
    if (!noticeId.trim()) {
      setError('Please enter a Notice ID');
      return;
    }

    try {
      setPreviewing(true);
      setError(null);

      const response = await fetch(`http://localhost:3001/api/samgov-import/preview/${noticeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to preview opportunity');
      }

      const data = await response.json();
      setPreview(data.data);
    } catch (err: any) {
      console.error('Preview error:', err);
      setError(err.message || 'Failed to preview opportunity');
    } finally {
      setPreviewing(false);
    }
  };

  const handleImport = async () => {
    if (!noticeId.trim()) {
      setError('Please enter a Notice ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/samgov-import/opportunity', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          opportunityId: noticeId,
          noticeId: noticeId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import opportunity');
      }

      const data = await response.json();
      setSuccess(true);

      // Redirect to the new proposal after a short delay
      setTimeout(() => {
        navigate(`/proposals/${data.data.id}`);
      }, 2000);
    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message || 'Failed to import opportunity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/proposals')}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center text-sm"
        >
          ← Back to Proposals
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Import from SAM.gov</h1>
        <p className="text-gray-600">Create a proposal directly from a SAM.gov opportunity</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <h3 className="font-semibold text-green-900">Import Successful!</h3>
              <p className="text-green-700 text-sm">Redirecting to proposal...</p>
            </div>
          </div>
        </div>
      )}

      {/* Import Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Enter SAM.gov Details</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notice ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={noticeId}
              onChange={(e) => setNoticeId(e.target.value)}
              placeholder="e.g., 123456789abcdef"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              disabled={loading || success}
            />
            <p className="text-sm text-gray-500 mt-1">
              Find the Notice ID in the SAM.gov opportunity URL or details page
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handlePreview}
              disabled={!noticeId.trim() || previewing || loading || success}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {previewing ? 'Loading Preview...' : 'Preview'}
            </button>
            <button
              onClick={handleImport}
              disabled={!noticeId.trim() || loading || success}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Importing...' : 'Import Opportunity'}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {preview && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <p className="text-gray-900">{preview.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Solicitation Number</label>
                <p className="text-gray-900">{preview.solicitationNumber || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agency</label>
                <p className="text-gray-900">{preview.agencyName || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <p className="text-gray-900">
                  {preview.dueDate ? new Date(preview.dueDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NAICS Code</label>
                <p className="text-gray-900">{preview.naicsCode || 'N/A'}</p>
              </div>
            </div>

            {preview.setAside && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Set-Aside</label>
                <p className="text-gray-900">{preview.setAside}</p>
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-2">
                Extracted Requirements ({preview.extractedRequirementsCount})
              </h3>
              {preview.requirements.length > 0 ? (
                <div className="space-y-2">
                  {preview.requirements.map((req, idx) => (
                    <div key={idx} className="bg-gray-50 rounded p-3">
                      <div className="flex items-start space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          req.type === 'mandatory' ? 'bg-red-100 text-red-800' :
                          req.type === 'desired' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {req.type}
                        </span>
                        <p className="text-sm text-gray-700 flex-1">{req.text}</p>
                      </div>
                    </div>
                  ))}
                  {preview.extractedRequirementsCount > 10 && (
                    <p className="text-sm text-gray-500 text-center">
                      + {preview.extractedRequirementsCount - 10} more requirements will be imported
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No requirements automatically extracted</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">How Import Works</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start">
            <span className="mr-2">1.</span>
            <span>Enter the SAM.gov Notice ID from the opportunity you want to import</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">2.</span>
            <span>Click Preview to see what will be imported (optional)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">3.</span>
            <span>Click Import to create a new proposal with all opportunity details</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">4.</span>
            <span>Requirements will be automatically extracted from the description</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
