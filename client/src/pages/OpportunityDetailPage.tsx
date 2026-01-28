// =============================================================================
// OPPORTUNITY DETAIL PAGE
// Shows full opportunity details with AI summary and proposal generation
// =============================================================================

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function OpportunityDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const opportunity = location.state?.opportunity;

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [score, setScore] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'checklist' | 'full'>('summary');

  useEffect(() => {
    if (!opportunity) {
      toast.error('No opportunity data found');
      navigate('/search');
      return;
    }

    // If opportunity already has AI data, use it
    if (opportunity.aiSummary) {
      setSummary(opportunity.aiSummary);
    }
    if (opportunity.aiScore) {
      setScore(opportunity.aiScore);
    } else {
      // Otherwise fetch AI analysis
      fetchAIAnalysis();
    }
  }, [opportunity]);

  async function fetchAIAnalysis() {
    setLoading(true);
    try {
      const [summaryRes, scoreRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/opportunities/summarize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ opportunity }),
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/opportunities/score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ opportunity }),
        }),
      ]);

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData.summary);
      }

      if (scoreRes.ok) {
        const scoreData = await scoreRes.json();
        setScore(scoreData.score);
      }

      toast.success('AI analysis complete');
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error('Failed to analyze opportunity');
    } finally {
      setLoading(false);
    }
  }

  async function generateProposal() {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/opportunities/generate-proposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity, summary }),
      });

      if (!response.ok) throw new Error('Proposal generation failed');

      const data = await response.json();

      // Navigate to proposal generator with the outline
      navigate('/proposal-generator', { state: { proposalOutline: data.proposalOutline, opportunity } });

      toast.success('Proposal outline generated!');
    } catch (error) {
      console.error('Proposal generation error:', error);
      toast.error('Failed to generate proposal');
    } finally {
      setLoading(false);
    }
  }

  if (!opportunity) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
          >
            ← Back to search
          </button>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {opportunity.title}
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Notice ID:</span>
                <p className="font-medium">{opportunity.noticeId}</p>
              </div>
              <div>
                <span className="text-gray-600">Solicitation:</span>
                <p className="font-medium">{opportunity.solicitationNumber || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600">Agency:</span>
                <p className="font-medium">{opportunity.department || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600">NAICS:</span>
                <p className="font-medium">{opportunity.naicsCode || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600">Posted:</span>
                <p className="font-medium">{opportunity.postedDate || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600">Deadline:</span>
                <p className="font-medium text-red-600">{opportunity.responseDeadLine || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600">Set-Aside:</span>
                <p className="font-medium">{opportunity.typeOfSetAsideDescription || 'None'}</p>
              </div>
              <div>
                <span className="text-gray-600">Type:</span>
                <p className="font-medium">{opportunity.type || 'N/A'}</p>
              </div>
            </div>

            {/* Score Display */}
            {score && (
              <div className="mt-4 flex items-center space-x-6 p-4 bg-blue-50 rounded-lg">
                <div>
                  <span className="text-sm text-gray-600">Match Score</span>
                  <div className="text-3xl font-bold text-blue-600">{score.score}/100</div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{score.reasoning}</p>
                  <div className="flex gap-2 mt-2">
                    {score.matchFactors.naicsMatch && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">✓ NAICS Match</span>}
                    {score.matchFactors.certificationMatch && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">✓ Certification Match</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'summary'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🤖 AI Summary
              </button>
              <button
                onClick={() => setActiveTab('checklist')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'checklist'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ✅ Compliance Checklist
              </button>
              <button
                onClick={() => setActiveTab('full')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'full'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📄 Full Description
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Analyzing opportunity...</p>
              </div>
            )}

            {/* AI Summary Tab */}
            {activeTab === 'summary' && summary && !loading && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Summary</h3>
                  <p className="text-gray-700">{summary.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Scope of Work</h3>
                  <p className="text-gray-700">{summary.scopeOfWork}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Action Items</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {summary.actionItems?.map((item: string, idx: number) => (
                      <li key={idx} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Key Dates</h3>
                    <div className="space-y-2 text-sm">
                      {summary.keyDates?.postedDate && <div><span className="font-medium">Posted:</span> {summary.keyDates.postedDate}</div>}
                      {summary.keyDates?.questionDeadline && <div><span className="font-medium text-orange-600">Questions Due:</span> {summary.keyDates.questionDeadline}</div>}
                      {summary.keyDates?.responseDeadline && <div><span className="font-medium text-red-600">Proposal Due:</span> {summary.keyDates.responseDeadline}</div>}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Submission</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Method:</span> {summary.submission?.method}</div>
                      <div><span className="font-medium">Instructions:</span> {summary.submission?.instructions}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    {summary.requirements?.forms?.length > 0 && (
                      <div>
                        <span className="font-medium">Required Forms:</span>
                        <ul className="list-disc list-inside mt-1">
                          {summary.requirements.forms.map((form: string, idx: number) => (
                            <li key={idx}>{form}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {summary.requirements?.certifications?.length > 0 && (
                      <div>
                        <span className="font-medium">Certifications:</span>
                        <ul className="list-disc list-inside mt-1">
                          {summary.requirements.certifications.map((cert: string, idx: number) => (
                            <li key={idx}>{cert}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Compliance Checklist Tab */}
            {activeTab === 'checklist' && summary && !loading && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold mb-4">Compliance Checklist</h3>
                {summary.complianceChecklist?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-start p-3 bg-gray-50 rounded-lg">
                    <input type="checkbox" className="mt-1 mr-3" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.item}</p>
                      <span className="text-xs text-gray-500 capitalize">{item.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Full Description Tab */}
            {activeTab === 'full' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Full Opportunity Description</h3>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                  {opportunity.description || 'No description available'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={generateProposal}
            disabled={loading || !summary}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed font-medium"
          >
            📝 Generate Proposal Outline
          </button>
          <button className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium">
            💾 Save Opportunity
          </button>
          <a
            href={opportunity.uiLink || `https://sam.gov`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
          >
            🔗 View on SAM.gov
          </a>
        </div>
      </div>
    </div>
  );
}
