// =============================================================================
// PROPOSALS DASHBOARD PAGE
// Main hub for viewing and managing proposals
// =============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Proposal {
  id: string;
  title: string;
  solicitationNumber?: string;
  agencyName?: string;
  dueDate?: string;
  status: 'draft' | 'in_progress' | 'under_review' | 'submitted' | 'won' | 'lost' | 'withdrawn';
  winProbability?: number;
  estimatedValue?: string;
  bidDecision?: 'bid' | 'no_bid' | 'maybe' | 'undecided';
  createdAt: string;
  updatedAt: string;
}

export default function ProposalsPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (session?.access_token) {
      fetchProposals();
    }
  }, [session]);

  const fetchProposals = async () => {
    if (!session?.access_token) return;

    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/proposals', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch proposals');
      }

      const data = await response.json();
      setProposals(data.data || []);
    } catch (err) {
      console.error('Error fetching proposals:', err);
      setError('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-purple-100 text-purple-800';
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBidDecisionColor = (decision?: string) => {
    switch (decision) {
      case 'bid': return 'bg-green-100 text-green-800';
      case 'no_bid': return 'bg-red-100 text-red-800';
      case 'maybe': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredProposals = proposals.filter(p =>
    filterStatus === 'all' || p.status === filterStatus
  );

  const statsCounts = {
    total: proposals.length,
    draft: proposals.filter(p => p.status === 'draft').length,
    in_progress: proposals.filter(p => p.status === 'in_progress').length,
    submitted: proposals.filter(p => p.status === 'submitted').length,
    won: proposals.filter(p => p.status === 'won').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Proposals</h1>
        <p className="text-gray-600">Manage your government contract proposals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Total</div>
          <div className="text-2xl font-bold text-gray-900">{statsCounts.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Draft</div>
          <div className="text-2xl font-bold text-gray-600">{statsCounts.draft}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">In Progress</div>
          <div className="text-2xl font-bold text-blue-600">{statsCounts.in_progress}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Submitted</div>
          <div className="text-2xl font-bold text-purple-600">{statsCounts.submitted}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Won</div>
          <div className="text-2xl font-bold text-green-600">{statsCounts.won}</div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <label className="text-sm text-gray-600">Filter:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="in_progress">In Progress</option>
            <option value="under_review">Under Review</option>
            <option value="submitted">Submitted</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/proposals/import')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            Import from SAM.gov
          </button>
          <button
            onClick={() => navigate('/proposals/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            + New Proposal
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No proposals yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first proposal or importing from SAM.gov</p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => navigate('/proposals/import')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Import from SAM.gov
            </button>
            <button
              onClick={() => navigate('/proposals/new')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create New Proposal
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 cursor-pointer"
              onClick={() => navigate(`/proposals/${proposal.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{proposal.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                      {proposal.status.replace('_', ' ')}
                    </span>
                    {proposal.bidDecision && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBidDecisionColor(proposal.bidDecision)}`}>
                        {proposal.bidDecision.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {proposal.solicitationNumber && (
                      <div>
                        <span className="text-gray-500">Solicitation:</span>
                        <span className="ml-2 text-gray-900">{proposal.solicitationNumber}</span>
                      </div>
                    )}
                    {proposal.agencyName && (
                      <div>
                        <span className="text-gray-500">Agency:</span>
                        <span className="ml-2 text-gray-900">{proposal.agencyName}</span>
                      </div>
                    )}
                    {proposal.dueDate && (
                      <div>
                        <span className="text-gray-500">Due:</span>
                        <span className="ml-2 text-gray-900">{new Date(proposal.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {proposal.estimatedValue && (
                      <div>
                        <span className="text-gray-500">Value:</span>
                        <span className="ml-2 text-gray-900">${parseFloat(proposal.estimatedValue).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {proposal.winProbability !== undefined && (
                    <div className="mt-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500">Win Probability:</span>
                        <div className="flex-1 max-w-xs">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                proposal.winProbability >= 70 ? 'bg-green-500' :
                                proposal.winProbability >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${proposal.winProbability}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{proposal.winProbability}%</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/proposals/${proposal.id}`);
                    }}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded transition-colors text-sm font-medium"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
