export default function ComingSoonPage() {
  const roadmapFeatures = [
    {
      category: 'AI-Powered Features',
      timeline: 'Q1 2026',
      status: 'In Development',
      features: [
        {
          title: 'AI Proposal Assistant',
          description: 'Get AI-powered help writing compelling proposals with automated compliance checking and suggestion for improvements.',
          icon: '🤖',
          priority: 'High'
        },
        {
          title: 'Smart Bid/No-Bid Analysis',
          description: 'AI analyzes opportunities against your company profile and provides data-driven recommendations on which opportunities to pursue.',
          icon: '🎯',
          priority: 'High'
        },
        {
          title: 'Automated Bid/No-Bid Decision Tool',
          description: 'AI analyzes opportunities against your capabilities, resources, and win probability to recommend whether to bid or pass, saving time on unwinnable opportunities.',
          icon: '⚖️',
          priority: 'High'
        },
        {
          title: 'Automated Opportunity Matching',
          description: 'Machine learning algorithm that learns from your behavior and automatically surfaces the most relevant opportunities.',
          icon: '🔍',
          priority: 'Medium'
        }
      ]
    },
    {
      category: 'Team Collaboration',
      timeline: 'Q2 2026',
      status: 'Planned',
      features: [
        {
          title: 'Team Workspaces',
          description: 'Invite team members to collaborate on opportunities, share notes, and assign tasks.',
          icon: '👥',
          priority: 'High'
        },
        {
          title: 'Proposal Collaboration',
          description: 'Real-time collaborative editing of proposals with version control and comment threads.',
          icon: '📝',
          priority: 'Medium'
        },
        {
          title: 'Team Capability Gap Analysis',
          description: 'Identify missing skills and certifications on your team for specific opportunities, with recommendations for training or subcontractor partnerships.',
          icon: '📊',
          priority: 'Medium'
        },
        {
          title: 'Internal Messaging',
          description: 'Chat with your team about specific opportunities without leaving the platform.',
          icon: '💬',
          priority: 'Medium'
        }
      ]
    },
    {
      category: 'Advanced Analytics',
      timeline: 'Q2 2026',
      status: 'Planned',
      features: [
        {
          title: 'Win Rate Dashboard',
          description: 'Track your proposal submission history, win rates, and identify patterns in successful bids.',
          icon: '📊',
          priority: 'High'
        },
        {
          title: 'Market Intelligence',
          description: 'Analyze trends in your industry, see which agencies are most active, and identify emerging opportunities.',
          icon: '📈',
          priority: 'Medium'
        },
        {
          title: 'Competitor Analysis',
          description: 'Track competitors who frequently win in your space and analyze their winning strategies.',
          icon: '🔎',
          priority: 'Low'
        }
      ]
    },
    {
      category: 'Automation & Integrations',
      timeline: 'Q3 2026',
      status: 'Research Phase',
      features: [
        {
          title: 'SAM.gov Direct Import',
          description: 'Automatically import opportunities directly from SAM.gov into your workspace with one click, no manual data entry required.',
          icon: '🔗',
          priority: 'High'
        },
        {
          title: 'CRM Integration',
          description: 'Sync opportunities directly with Salesforce, HubSpot, or other popular CRM platforms.',
          icon: '🔄',
          priority: 'High'
        },
        {
          title: 'Automated Daily Briefs',
          description: 'Receive a personalized daily email with new opportunities matching your criteria.',
          icon: '📧',
          priority: 'Medium'
        },
        {
          title: 'Slack/Teams Integration',
          description: 'Get real-time notifications in your team communication tools.',
          icon: '🔔',
          priority: 'Medium'
        },
        {
          title: 'Calendar Integration',
          description: 'Automatically sync opportunity deadlines to your Google Calendar or Outlook.',
          icon: '📅',
          priority: 'Low'
        }
      ]
    },
    {
      category: 'Enhanced Search & Discovery',
      timeline: 'Q1 2026',
      status: 'In Development',
      features: [
        {
          title: 'Natural Language Search',
          description: 'Search using plain English queries like "software contracts under $500k for DoD".',
          icon: '💡',
          priority: 'High'
        },
        {
          title: 'Saved Search Templates',
          description: 'Create and save complex search queries as templates for quick access.',
          icon: '⭐',
          priority: 'Medium'
        },
        {
          title: 'Similar Opportunities Finder',
          description: 'Find opportunities similar to ones you\'ve bookmarked or won in the past.',
          icon: '🔄',
          priority: 'Medium'
        }
      ]
    },
    {
      category: 'Document Management',
      timeline: 'Q3 2026',
      status: 'Research Phase',
      features: [
        {
          title: 'Document Library',
          description: 'Store and organize past proposals, capability statements, and certifications.',
          icon: '📚',
          priority: 'Medium'
        },
        {
          title: 'Template Manager',
          description: 'Create reusable proposal templates with dynamic fields for quick proposal generation.',
          icon: '📄',
          priority: 'Medium'
        },
        {
          title: 'Compliance Checklist Builder',
          description: 'Build custom compliance checklists for different types of solicitations.',
          icon: '✅',
          priority: 'Low'
        }
      ]
    },
    {
      category: 'Mobile Experience',
      timeline: 'Q4 2026',
      status: 'Planned',
      features: [
        {
          title: 'iOS & Android Apps',
          description: 'Native mobile apps for searching opportunities and receiving notifications on the go.',
          icon: '📱',
          priority: 'Medium'
        },
        {
          title: 'Offline Access',
          description: 'Download opportunity details for offline reading and annotation.',
          icon: '✈️',
          priority: 'Low'
        }
      ]
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Development':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Planned':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Research Phase':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'Low':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Coming Soon
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            We're constantly innovating to bring you powerful new features that make finding and winning government contracts easier than ever.
          </p>

          {/* MVP Notice */}
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border-2 border-indigo-200 p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900 mb-2">📋 MVP Version Notice</h3>
                <p className="text-sm text-gray-700">
                  This platform is currently in <strong>MVP (Minimum Viable Product)</strong> stage.
                  Core search and discovery features are fully functional, but some features like email notifications,
                  proposal generation, and team collaboration are not yet operational. The roadmap below shows our planned enhancements.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Overview */}
        <div className="mb-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Development Timeline
          </h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="text-sm font-semibold text-green-700 mb-1">Q1 2026</div>
                <div className="text-xs text-green-600">In Development</div>
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="text-sm font-semibold text-blue-700 mb-1">Q2 2026</div>
                <div className="text-xs text-blue-600">Planned</div>
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                <div className="text-sm font-semibold text-purple-700 mb-1">Q3 2026</div>
                <div className="text-xs text-purple-600">Research Phase</div>
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
                <div className="text-sm font-semibold text-indigo-700 mb-1">Q4 2026</div>
                <div className="text-xs text-indigo-600">Planned</div>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap Categories */}
        <div className="space-y-8">
          {roadmapFeatures.map((category, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Category Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">
                    {category.category}
                  </h2>
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                      {category.timeline}
                    </span>
                    <span className={`px-3 py-1 ${getStatusColor(category.status)} text-sm font-medium rounded-full border`}>
                      {category.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div className="p-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {category.features.map((feature, featureIdx) => (
                    <div
                      key={featureIdx}
                      className="group border-2 border-gray-200 rounded-lg p-6 hover:border-blue-400 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-4xl">{feature.icon}</div>
                        <span className={`px-2 py-1 ${getPriorityColor(feature.priority)} text-xs font-medium rounded`}>
                          {feature.priority}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Have a Feature Request?
          </h2>
          <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
            We're always listening to our users. If you have ideas for features that would help you win more contracts, we want to hear from you!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg">
              Submit Feature Request
            </button>
            <button className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition-colors">
              Join Beta Program
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Development timelines are estimates and subject to change. We'll keep you updated on our progress!
          </p>
        </div>
      </div>
    </div>
  )
}
