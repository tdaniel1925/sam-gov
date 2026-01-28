// =============================================================================
// PROPOSAL GENERATOR PAGE
// Interactive proposal builder with AI-generated outline and content blocks
// =============================================================================

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function ProposalGeneratorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const proposalOutline = location.state?.proposalOutline;
  const opportunity = location.state?.opportunity;

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['1.0']));
  const [activeView, setActiveView] = useState<'outline' | 'matrix'>('outline');

  useEffect(() => {
    if (!proposalOutline) {
      toast.error('No proposal outline found');
      navigate('/search');
    }
  }, [proposalOutline, navigate]);

  function toggleSection(sectionNumber: string) {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionNumber)) {
      newExpanded.delete(sectionNumber);
    } else {
      newExpanded.add(sectionNumber);
    }
    setExpandedSections(newExpanded);
  }

  function exportProposal() {
    toast.success('Proposal export feature coming soon!');
  }

  if (!proposalOutline) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
          >
            ← Back
          </button>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Proposal Outline
                </h1>
                <p className="text-gray-600">{proposalOutline.opportunityTitle}</p>
                {proposalOutline.solicitationNumber && (
                  <p className="text-sm text-gray-500 mt-1">
                    Solicitation: {proposalOutline.solicitationNumber}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Estimated Pages</div>
                <div className="text-3xl font-bold text-blue-600">
                  {proposalOutline.estimatedPageCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveView('outline')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeView === 'outline'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📝 Proposal Outline
              </button>
              <button
                onClick={() => setActiveView('matrix')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeView === 'matrix'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                ✅ Compliance Matrix
              </button>
            </nav>
          </div>
        </div>

        {/* Executive Summary */}
        {activeView === 'outline' && (
          <>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Executive Summary</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Overview</h3>
                  <p className="text-gray-700">{proposalOutline.executiveSummary.overview}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Value Proposition</h3>
                  <p className="text-gray-700">{proposalOutline.executiveSummary.valueProposition}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Why Choose Us</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {proposalOutline.executiveSummary.whyUs?.map((item: string, idx: number) => (
                      <li key={idx} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Proposal Sections */}
            <div className="space-y-4">
              {proposalOutline.sections?.map((section: any) => (
                <div key={section.sectionNumber} className="bg-white rounded-lg shadow-sm">
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleSection(section.sectionNumber)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">
                          {section.sectionNumber}. {section.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                        {section.pageLimit && (
                          <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            Page Limit: {section.pageLimit}
                          </span>
                        )}
                      </div>
                      <div className="ml-4 text-2xl text-gray-400">
                        {expandedSections.has(section.sectionNumber) ? '−' : '+'}
                      </div>
                    </div>
                  </div>

                  {expandedSections.has(section.sectionNumber) && (
                    <div className="px-6 pb-6 border-t border-gray-200">
                      <div className="mt-4 space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Content Guidance</h4>
                          <p className="text-gray-700">{section.suggestedContent}</p>
                        </div>

                        {section.requiredContent && section.requiredContent.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Must Address</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {section.requiredContent.map((req: string, idx: number) => (
                                <li key={idx} className="text-gray-700">{req}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Subsections */}
                        {section.subsections && section.subsections.length > 0 && (
                          <div className="mt-4 pl-4 border-l-2 border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-3">Subsections</h4>
                            {section.subsections.map((sub: any) => (
                              <div key={sub.sectionNumber} className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <h5 className="font-semibold text-gray-900">
                                  {sub.sectionNumber}. {sub.title}
                                </h5>
                                <p className="text-sm text-gray-600 mt-1">{sub.description}</p>
                                <p className="text-sm text-gray-700 mt-2">{sub.suggestedContent}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                            📝 Add Content from Library
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Appendices */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h2 className="text-xl font-bold mb-4">Appendices</h2>
              <ul className="space-y-2">
                {proposalOutline.appendices?.map((appendix: string, idx: number) => (
                  <li key={idx} className="flex items-center">
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-gray-700">{appendix}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Compliance Matrix */}
        {activeView === 'matrix' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Compliance Matrix</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requirement
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RFP Section
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proposal Section
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {proposalOutline.complianceMatrix?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="px-4 py-4 text-sm text-gray-900">{item.requirement}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{item.rfpSection}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{item.proposalSection}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === 'compliant' ? 'bg-green-100 text-green-800' :
                          item.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status === 'not-addressed' ? 'To Do' : item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={exportProposal}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            📤 Export Proposal (Word/PDF)
          </button>
          <button className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium">
            💾 Save Draft
          </button>
        </div>
      </div>
    </div>
  );
}
