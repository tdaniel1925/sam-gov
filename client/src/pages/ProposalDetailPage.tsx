// =============================================================================
// PROPOSAL DETAIL PAGE
// View and manage individual proposal with AI analysis
// =============================================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Proposal {
  id: string;
  title: string;
  solicitationNumber?: string;
  agencyName?: string;
  dueDate?: string;
  status: string;
  winProbability?: number;
  estimatedValue?: string;
  bidDecision?: string;
  bidDecisionReasoning?: string;
  metadata?: any;
  sections?: any[];
  requirements?: any[];
}

interface BidAnalysis {
  recommendation: string;
  confidenceLevel: number;
  winProbability: number;
  scores: {
    pastPerformance: number;
    technicalCapability: number;
    resourceAvailability: number;
    competitiveLandscape: number;
  };
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  recommendations: string[];
  reasoning: string;
}

interface CapabilityAnalysis {
  overallReadiness: number;
  criticalGaps: any[];
  mediumGaps: any[];
  lowGaps: any[];
  strengths: string[];
  recommendations: string[];
  summary: string;
}

export default function ProposalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [bidAnalysis, setBidAnalysis] = useState<BidAnalysis | null>(null);
  const [capabilityAnalysis, setCapabilityAnalysis] = useState<CapabilityAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'bid-decision' | 'capability-gaps'>('overview');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProposal();
    }
  }, [id]);

  const fetchProposal = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/proposals/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch proposal');

      const data = await response.json();
      setProposal(data.data);

      // Try to fetch existing bid decision
      try {
        const bidResponse = await fetch(`http://localhost:3001/api/bid-decisions/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (bidResponse.ok) {
          const bidData = await bidResponse.json();
          setBidAnalysis(bidData.data);
        }
      } catch (err) {
        // No existing bid decision
      }

      // Try to fetch existing capability gaps
      try {
        const gapResponse = await fetch(`http://localhost:3001/api/capability-gaps/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (gapResponse.ok) {
          const gapData = await gapResponse.json();
          if (gapData.data && gapData.data.length > 0) {
            // Convert gaps array to analysis format
            const gaps = gapData.data;
            setCapabilityAnalysis({
              overallReadiness: 50,
              criticalGaps: gaps.filter((g: any) => g.criticality === 'high'),
              mediumGaps: gaps.filter((g: any) => g.criticality === 'medium'),
              lowGaps: gaps.filter((g: any) => g.criticality === 'low'),
              strengths: [],
              recommendations: [],
              summary: 'Capability analysis completed',
            });
          }
        }
      } catch (err) {
        // No existing capability gaps
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError('Failed to load proposal');
    } finally {
      setLoading(false);
    }
  };

  const handleBidAnalysis = async () => {
    try {
      setAnalyzing(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/bid-decisions/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proposalId: id }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setBidAnalysis(data.data);
      setActiveTab('bid-decision');

      // Refresh proposal to get updated win probability
      await fetchProposal();
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError('Failed to run bid analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCapabilityAnalysis = async () => {
    try {
      setAnalyzing(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/capability-gaps/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proposalId: id }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setCapabilityAnalysis(data.data);
      setActiveTab('capability-gaps');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError('Failed to run capability analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Proposal Not Found</h2>
        <button
          onClick={() => navigate('/proposals')}
          className="text-blue-600 hover:text-blue-700"
        >
          ← Back to Proposals
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/proposals')}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center text-sm"
        >
          ← Back to Proposals
        </button>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{proposal.title}</h1>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              {proposal.solicitationNumber && (
                <span>Solicitation: {proposal.solicitationNumber}</span>
              )}
              {proposal.agencyName && (
                <span>• {proposal.agencyName}</span>
              )}
              {proposal.dueDate && (
                <span>• Due: {new Date(proposal.dueDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleBidAnalysis}
              disabled={analyzing}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors text-sm font-medium"
            >
              {analyzing ? 'Analyzing...' : 'Run Bid Analysis'}
            </button>
            <button
              onClick={handleCapabilityAnalysis}
              disabled={analyzing}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-300 transition-colors text-sm font-medium"
            >
              {analyzing ? 'Analyzing...' : 'Run Gap Analysis'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('bid-decision')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bid-decision'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Bid/No-Bid Decision
            {bidAnalysis && <span className="ml-2 text-green-600">✓</span>}
          </button>
          <button
            onClick={() => setActiveTab('capability-gaps')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'capability-gaps'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Capability Gaps
            {capabilityAnalysis && <span className="ml-2 text-green-600">✓</span>}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Proposal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <p className="text-gray-900">{proposal.status}</p>
              </div>
              {proposal.estimatedValue && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Value</label>
                  <p className="text-gray-900">${parseFloat(proposal.estimatedValue).toLocaleString()}</p>
                </div>
              )}
              {proposal.winProbability !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Win Probability</label>
                  <p className="text-gray-900">{proposal.winProbability}%</p>
                </div>
              )}
              {proposal.bidDecision && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bid Decision</label>
                  <p className="text-gray-900">{proposal.bidDecision.replace('_', ' ')}</p>
                </div>
              )}
            </div>
          </div>

          {proposal.requirements && proposal.requirements.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Requirements ({proposal.requirements.length})
              </h2>
              <div className="space-y-2">
                {proposal.requirements.map((req: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 rounded p-3">
                    <div className="flex items-start space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        req.requirementType === 'mandatory' ? 'bg-red-100 text-red-800' :
                        req.requirementType === 'desired' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {req.requirementType}
                      </span>
                      <p className="text-sm text-gray-700 flex-1">{req.requirementText}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'bid-decision' && (
        <div className="space-y-6">
          {!bidAnalysis ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00 2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bid Analysis Yet</h3>
              <p className="text-gray-600 mb-6">Run AI analysis to get a bid/no-bid recommendation</p>
              <button
                onClick={handleBidAnalysis}
                disabled={analyzing}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                {analyzing ? 'Analyzing...' : 'Run Bid Analysis'}
              </button>
            </div>
          ) : (
            <>
              {/* Recommendation Card */}
              <div className={`rounded-lg shadow p-6 ${
                bidAnalysis.recommendation === 'bid' ? 'bg-green-50 border-2 border-green-200' :
                bidAnalysis.recommendation === 'no_bid' ? 'bg-red-50 border-2 border-red-200' :
                'bg-yellow-50 border-2 border-yellow-200'
              }`}>
                <h2 className="text-2xl font-bold mb-2">
                  Recommendation: <span className="uppercase">{bidAnalysis.recommendation.replace('_', ' ')}</span>
                </h2>
                <p className="text-lg mb-4">Win Probability: {bidAnalysis.winProbability}% | Confidence: {bidAnalysis.confidenceLevel}%</p>
                <p className="text-gray-700">{bidAnalysis.reasoning}</p>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600 mb-1">Past Performance</div>
                  <div className="text-2xl font-bold text-gray-900">{bidAnalysis.scores.pastPerformance}%</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600 mb-1">Technical Capability</div>
                  <div className="text-2xl font-bold text-gray-900">{bidAnalysis.scores.technicalCapability}%</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600 mb-1">Resources</div>
                  <div className="text-2xl font-bold text-gray-900">{bidAnalysis.scores.resourceAvailability}%</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600 mb-1">Competition</div>
                  <div className="text-2xl font-bold text-gray-900">{bidAnalysis.scores.competitiveLandscape}%</div>
                </div>
              </div>

              {/* SWOR */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold text-green-700 mb-3">Strengths</h3>
                  <ul className="space-y-2">
                    {bidAnalysis.strengths.map((s, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold text-red-700 mb-3">Weaknesses</h3>
                  <ul className="space-y-2">
                    {bidAnalysis.weaknesses.map((w, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start">
                        <span className="text-red-500 mr-2">✗</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold text-yellow-700 mb-3">Risks</h3>
                  <ul className="space-y-2">
                    {bidAnalysis.risks.map((r, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start">
                        <span className="text-yellow-500 mr-2">⚠</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold text-blue-700 mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {bidAnalysis.recommendations.map((r, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start">
                        <span className="text-blue-500 mr-2">→</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'capability-gaps' && (
        <div className="space-y-6">
          {!capabilityAnalysis ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Capability Analysis Yet</h3>
              <p className="text-gray-600 mb-6">Run AI analysis to identify team capability gaps</p>
              <button
                onClick={handleCapabilityAnalysis}
                disabled={analyzing}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                {analyzing ? 'Analyzing...' : 'Run Gap Analysis'}
              </button>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Overall Team Readiness</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full ${
                          capabilityAnalysis.overallReadiness >= 70 ? 'bg-green-500' :
                          capabilityAnalysis.overallReadiness >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${capabilityAnalysis.overallReadiness}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{capabilityAnalysis.overallReadiness}%</span>
                </div>
                <p className="text-gray-600 mt-3">{capabilityAnalysis.summary}</p>
              </div>

              {/* Critical Gaps */}
              {capabilityAnalysis.criticalGaps.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold text-red-700 mb-4">Critical Gaps ({capabilityAnalysis.criticalGaps.length})</h3>
                  <div className="space-y-3">
                    {capabilityAnalysis.criticalGaps.map((gap: any, idx: number) => (
                      <div key={idx} className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                        <h4 className="font-medium text-gray-900 mb-1">{gap.requiredSkill}</h4>
                        <p className="text-sm text-gray-700 mb-2">{gap.gapDescription}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Action: <strong>{gap.recommendedAction}</strong></span>
                          {gap.estimatedCost && <span className="text-gray-600">Cost: ${gap.estimatedCost.toLocaleString()}</span>}
                          {gap.timeToFill && <span className="text-gray-600">{gap.timeToFill} days</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medium Gaps */}
              {capabilityAnalysis.mediumGaps.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold text-yellow-700 mb-4">Medium Priority Gaps ({capabilityAnalysis.mediumGaps.length})</h3>
                  <div className="space-y-3">
                    {capabilityAnalysis.mediumGaps.map((gap: any, idx: number) => (
                      <div key={idx} className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded">
                        <h4 className="font-medium text-gray-900 mb-1">{gap.requiredSkill}</h4>
                        <p className="text-sm text-gray-700 mb-2">{gap.gapDescription}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Action: <strong>{gap.recommendedAction}</strong></span>
                          {gap.estimatedCost && <span className="text-gray-600">Cost: ${gap.estimatedCost.toLocaleString()}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {capabilityAnalysis.recommendations.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold text-blue-700 mb-4">Recommendations</h3>
                  <ul className="space-y-2">
                    {capabilityAnalysis.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start">
                        <span className="text-blue-500 mr-2">→</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
