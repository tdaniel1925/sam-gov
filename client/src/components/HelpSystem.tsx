// =============================================================================
// HELP SYSTEM COMPONENT
// Following CodeBakers pattern 04-frontend.md
// Contextual help and quick access to documentation
// =============================================================================

import { useState } from 'react';
import { HelpCircle, X, Search, ChevronRight, ExternalLink } from 'lucide-react';

interface HelpSystemProps {
  context?: 'search' | 'saved' | 'notifications' | 'profile' | 'opportunities';
}

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  link: string;
}

const CONTEXTUAL_HELP: Record<string, HelpTopic[]> = {
  search: [
    {
      id: 'search-basics',
      title: 'How to Search',
      description: 'Learn how to search for opportunities by NAICS code',
      link: '/documentation/opportunity-search',
    },
    {
      id: 'naics-codes',
      title: 'Understanding NAICS Codes',
      description: 'What are NAICS codes and how to find yours',
      link: '/documentation/naics-codes',
    },
    {
      id: 'date-filters',
      title: 'Using Date Filters',
      description: 'Filter opportunities by posted date',
      link: '/documentation/opportunity-search',
    },
  ],
  saved: [
    {
      id: 'saving-opportunities',
      title: 'Saving Opportunities',
      description: 'How to save and manage opportunities',
      link: '/documentation/saving-opportunities',
    },
    {
      id: 'exports',
      title: 'Exporting Data',
      description: 'Export opportunities to CSV, PDF, or Excel',
      link: '/documentation/exports',
    },
  ],
  notifications: [
    {
      id: 'auto-monitoring',
      title: 'Auto-Monitoring',
      description: 'Learn about automatic opportunity tracking',
      link: '/documentation/auto-monitoring-overview',
    },
    {
      id: 'email-setup',
      title: 'Setting Up Notifications',
      description: 'Configure email alerts for new opportunities',
      link: '/documentation/auto-monitoring-overview',
    },
  ],
  profile: [
    {
      id: 'company-profile',
      title: 'Company Profile Setup',
      description: 'Create your profile for AI scoring',
      link: '/documentation/quick-start',
    },
    {
      id: 'improving-scores',
      title: 'Improving AI Scores',
      description: 'Optimize your profile for better match scores',
      link: '/documentation/improving-scores',
    },
  ],
  opportunities: [
    {
      id: 'new-today',
      title: 'Using "New Today"',
      description: 'Check fresh opportunities discovered today',
      link: '/documentation/new-today',
    },
    {
      id: 'ai-scoring',
      title: 'Understanding AI Scores',
      description: 'How opportunities are scored and ranked',
      link: '/documentation/ai-scoring-explained',
    },
  ],
};

const QUICK_LINKS = [
  {
    id: 'quick-start',
    title: 'Quick Start Guide',
    icon: '🚀',
    link: '/documentation/quick-start',
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: '🔧',
    link: '/documentation/common-issues',
  },
  {
    id: 'contracting-basics',
    title: 'Contracting Basics',
    icon: '🏛️',
    link: '/documentation/contracting-basics',
  },
  {
    id: 'chatbot',
    title: 'Ask AI Assistant',
    icon: '🤖',
    link: '/chat',
  },
];

export default function HelpSystem({ context }: HelpSystemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const contextHelp = context ? CONTEXTUAL_HELP[context] || [] : [];

  return (
    <>
      {/* Help Button - Fixed position */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors z-40"
        aria-label="Open help"
      >
        <HelpCircle size={24} />
      </button>

      {/* Help Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-white shadow-2xl z-50 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle size={24} />
                <h2 className="text-xl font-semibold">Help & Support</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-blue-700 rounded p-1"
                aria-label="Close help"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Search Help */}
              <div>
                <a
                  href="/documentation"
                  className="flex items-center gap-2 w-full bg-gray-100 hover:bg-gray-200 rounded-lg p-3 transition-colors"
                >
                  <Search size={20} className="text-gray-600" />
                  <span className="font-medium text-gray-900">Search Documentation</span>
                  <ChevronRight size={20} className="text-gray-400 ml-auto" />
                </a>
              </div>

              {/* Contextual Help */}
              {contextHelp.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                    Help for this Page
                  </h3>
                  <div className="space-y-2">
                    {contextHelp.map((topic) => (
                      <a
                        key={topic.id}
                        href={topic.link}
                        className="block bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md rounded-lg p-3 transition-all"
                      >
                        <h4 className="font-medium text-gray-900 mb-1">{topic.title}</h4>
                        <p className="text-sm text-gray-600">{topic.description}</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Links */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Quick Links
                </h3>
                <div className="space-y-2">
                  {QUICK_LINKS.map((link) => (
                    <a
                      key={link.id}
                      href={link.link}
                      className="flex items-center gap-3 bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md rounded-lg p-3 transition-all"
                    >
                      <span className="text-2xl">{link.icon}</span>
                      <span className="font-medium text-gray-900">{link.title}</span>
                      {link.id === 'chatbot' ? (
                        <ChevronRight size={20} className="text-blue-600 ml-auto" />
                      ) : (
                        <ExternalLink size={16} className="text-gray-400 ml-auto" />
                      )}
                    </a>
                  ))}
                </div>
              </div>

              {/* Browse All Documentation */}
              <div>
                <a
                  href="/documentation"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-medium py-3 rounded-lg transition-colors"
                >
                  Browse All Documentation
                </a>
              </div>

              {/* Contact Support */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Need More Help?
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Can't find what you're looking for? Our AI assistant can help answer questions about the app and government contracting.
                </p>
                <a
                  href="/chat"
                  className="block w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-center font-medium py-2 rounded-lg transition-colors"
                >
                  Chat with AI Assistant
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
