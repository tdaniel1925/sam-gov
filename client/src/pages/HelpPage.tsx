import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState<string>('getting-started');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const categories = [
    { id: 'getting-started', label: 'Getting Started', icon: '🚀' },
    { id: 'search', label: 'Search & Filters', icon: '🔍' },
    { id: 'ai-features', label: 'AI Features', icon: '🤖' },
    { id: 'saved', label: 'Saved & Bookmarks', icon: '📌' },
    { id: 'alerts', label: 'Email Alerts', icon: '📧' },
    { id: 'account', label: 'Account & Profile', icon: '👤' },
  ];

  const faqs: FAQItem[] = [
    // Getting Started
    {
      category: 'getting-started',
      question: 'What is SAM.gov Opportunities?',
      answer: 'SAM.gov Opportunities is a platform that helps you discover and track federal government contract opportunities. We aggregate thousands of opportunities from SAM.gov and provide advanced search, AI-powered analysis, and email alerts to help you find contracts that match your business capabilities.'
    },
    {
      category: 'getting-started',
      question: 'How do I create an account?',
      answer: 'Click the "Sign Up" button on the login page. Enter your first name, last name, email, and create a password. You\'ll receive a welcome email to confirm your account. Once confirmed, you can start exploring opportunities immediately.'
    },
    {
      category: 'getting-started',
      question: 'What are the analytics cards on the dashboard?',
      answer: 'The dashboard shows 4 key metrics: Total Available (all current opportunities), New This Week (posted in last 7 days), Expiring Soon (deadlines within 7 days), and Saved (your bookmarked opportunities). These give you a quick overview of what\'s happening.'
    },
    {
      category: 'getting-started',
      question: 'How do I navigate between pages?',
      answer: 'Use the navigation menu at the top of every page. Click Dashboard, Advanced Search, Saved, Notifications, or Profile to jump to that section. You can also use the quick action cards on the dashboard for faster navigation.'
    },

    // Search & Filters
    {
      category: 'search',
      question: 'How do I search for opportunities?',
      answer: 'Go to Advanced Search from the navigation menu or quick action card. You can filter by NAICS codes, agencies, set-aside types, dollar amounts, response deadlines, and keywords. Apply multiple filters to narrow down results to exactly what you need.'
    },
    {
      category: 'search',
      question: 'What is a NAICS code?',
      answer: 'NAICS (North American Industry Classification System) codes categorize businesses by industry. For example, 541512 is "Computer Systems Design Services" and 541330 is "Engineering Services". You can filter opportunities by your business\'s NAICS codes to find relevant contracts.'
    },
    {
      category: 'search',
      question: 'Can I save my search criteria?',
      answer: 'Yes! On the Advanced Search page, after applying your filters, click "Save This Search". You can then set up email alerts to be notified when new opportunities match your saved criteria.'
    },
    {
      category: 'search',
      question: 'How often is the data updated?',
      answer: 'We sync with SAM.gov multiple times per day to ensure you have the latest opportunities. The "New This Week" counter on your dashboard shows recently posted contracts. You can also click the Refresh button to manually update the list.'
    },

    // AI Features
    {
      category: 'ai-features',
      question: 'What is the AI Summary feature?',
      answer: 'When you click "View Details" on an opportunity, go to the AI Summary tab. Our GPT-4 powered system analyzes the full solicitation and provides a concise summary highlighting key requirements, deadlines, qualifications needed, and potential risks. This saves you hours of reading complex government documents.'
    },
    {
      category: 'ai-features',
      question: 'How does the AI Match Score work?',
      answer: 'The AI Match Score (0-100%) indicates how well an opportunity aligns with your company profile and capabilities. It considers your NAICS codes, past performance, company size, and technical capabilities. A higher score means the contract is a better fit for your business.'
    },
    {
      category: 'ai-features',
      question: 'What is the Proposal Kickstarter?',
      answer: 'The Proposal Assistant helps you start your proposal. It generates an outline based on the solicitation requirements, creates a compliance matrix, suggests response strategies, and identifies key requirements you must address. This gives you a head start on proposal writing.'
    },
    {
      category: 'ai-features',
      question: 'Do AI features cost extra?',
      answer: 'AI features are included with your account at no additional cost. We use advanced language models to provide summarization, scoring, and proposal assistance to help you win more contracts.'
    },

    // Saved & Bookmarks
    {
      category: 'saved',
      question: 'How do I save an opportunity?',
      answer: 'Click the purple bookmark icon on any opportunity card. The icon will fill in when saved. You can save unlimited opportunities. All your saved items appear on the Saved page and in the "Saved" counter on your dashboard.'
    },
    {
      category: 'saved',
      question: 'Can I add notes to saved opportunities?',
      answer: 'Yes! On the Saved page, your bookmarked opportunities display with an option to add private notes. Use notes to track follow-up actions, team assignments, or important details about each contract.'
    },
    {
      category: 'saved',
      question: 'How do I remove a saved opportunity?',
      answer: 'Click the filled purple bookmark icon again to unsave, or go to the Saved page and click the Delete button next to the opportunity. You\'ll see a confirmation toast message when removed.'
    },
    {
      category: 'saved',
      question: 'Are my saved opportunities private?',
      answer: 'Yes, your saved opportunities and notes are private to your account. No one else can see what you\'ve bookmarked or the notes you\'ve added.'
    },

    // Email Alerts
    {
      category: 'alerts',
      question: 'How do I set up email alerts?',
      answer: 'Go to the Notifications page (Email Alerts quick action card or navigation menu). Enter your email, the NAICS code you want to track, and choose your frequency (Daily, Weekly, or Real-time). Click Subscribe. You\'ll start receiving emails when new opportunities match your criteria.'
    },
    {
      category: 'alerts',
      question: 'What\'s the difference between Daily, Weekly, and Real-time?',
      answer: 'Daily: One email at 8 AM with all new opportunities from yesterday. Weekly: One email every Monday summarizing the week\'s opportunities. Real-time: Immediate email as soon as a new opportunity is posted (best for time-sensitive contracts).'
    },
    {
      category: 'alerts',
      question: 'Can I subscribe to multiple NAICS codes?',
      answer: 'Yes! Create separate subscriptions for each NAICS code you want to track. Each subscription can have its own frequency setting. Manage all subscriptions from the Notifications page.'
    },
    {
      category: 'alerts',
      question: 'What does the sample email look like?',
      answer: 'On the Notifications page, scroll down to see a full preview of what you\'ll receive. The email includes opportunity titles, departments, NAICS codes, deadlines, descriptions, and direct links to view details. It\'s professionally formatted and mobile-friendly.'
    },

    // Account & Profile
    {
      category: 'account',
      question: 'How do I update my profile?',
      answer: 'Click Profile in the navigation menu. You can view your account details including email, user ID, and creation date. Advanced profile editing features (company info, NAICS codes, capabilities) are coming soon.'
    },
    {
      category: 'account',
      question: 'How do I change my password?',
      answer: 'Click "Forgot your password?" on the login page to receive a password reset email. Follow the link to create a new password. For security, we don\'t allow password changes from within the app without email verification.'
    },
    {
      category: 'account',
      question: 'Can I add team members?',
      answer: 'Team collaboration features are coming soon! You\'ll be able to share opportunities with team members, assign tasks, and collaborate on proposals. Stay tuned for updates.'
    },
    {
      category: 'account',
      question: 'How do I sign out?',
      answer: 'Click the "Sign Out" button in the top right corner of any page. You\'ll be redirected to the login page. Your saved opportunities and subscriptions will be preserved for when you log back in.'
    },
  ];

  const filteredFAQs = faqs.filter(faq => faq.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Center</h1>
        <p className="text-gray-600">Find answers to common questions and learn how to use all features</p>
      </div>

      {/* Quick Start Guide */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 mb-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Quick Start Guide</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div>
            <div className="text-4xl mb-3">1️⃣</div>
            <h3 className="font-semibold mb-2">Browse Opportunities</h3>
            <p className="text-blue-100 text-sm">View 20+ federal contracts on your dashboard. Click Refresh to load the latest.</p>
          </div>
          <div>
            <div className="text-4xl mb-3">2️⃣</div>
            <h3 className="font-semibold mb-2">Use Advanced Search</h3>
            <p className="text-blue-100 text-sm">Filter by NAICS, agency, set-aside type, and more to find perfect matches.</p>
          </div>
          <div>
            <div className="text-4xl mb-3">3️⃣</div>
            <h3 className="font-semibold mb-2">Save & Analyze</h3>
            <p className="text-blue-100 text-sm">Bookmark opportunities and use AI to get summaries and match scores.</p>
          </div>
          <div>
            <div className="text-4xl mb-3">4️⃣</div>
            <h3 className="font-semibold mb-2">Set Up Alerts</h3>
            <p className="text-blue-100 text-sm">Get email notifications when new contracts match your criteria.</p>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setExpandedFAQ(null);
              }}
              className={`px-4 py-3 rounded-lg text-left transition-all ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="text-2xl mb-1">{cat.icon}</div>
              <div className="text-sm font-medium">{cat.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {categories.find(c => c.id === activeCategory)?.label} Questions
          </h2>

          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-600 transition-transform flex-shrink-0 ${
                      expandedFAQ === index ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 py-4 bg-white border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Video Tutorials Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-md p-8 mt-8 border border-purple-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Video Tutorials</h2>
        <p className="text-gray-700 mb-6">
          Watch step-by-step video guides to master the platform (Coming Soon)
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg mb-3 flex items-center justify-center">
              <svg className="w-12 h-12 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Getting Started (5 min)</h3>
            <p className="text-sm text-gray-600">Learn the basics and find your first opportunity</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-3 flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Advanced Search (8 min)</h3>
            <p className="text-sm text-gray-600">Master filters and find perfect contract matches</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="w-full h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-lg mb-3 flex items-center justify-center">
              <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Features (10 min)</h3>
            <p className="text-sm text-gray-600">Use AI summaries and match scores effectively</p>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-white rounded-lg shadow-md p-8 mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
        <p className="text-gray-700 mb-6">
          Can't find what you're looking for? Our support team is here to help!
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 text-sm mb-2">Get a response within 24 hours</p>
              <a href="mailto:support@samgov-opportunities.com" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                support@samgov-opportunities.com
              </a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Live Chat (Coming Soon)</h3>
              <p className="text-gray-600 text-sm mb-2">Chat with our team in real-time</p>
              <span className="text-gray-400 text-sm">Available Monday-Friday, 9 AM - 5 PM ET</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tips & Best Practices */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg shadow-md p-8 mt-8 border border-amber-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-7 h-7 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Pro Tips
        </h2>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="text-amber-600 mt-1">💡</span>
            <p className="text-gray-700"><strong>Check daily:</strong> New opportunities are posted throughout the day. Visit your dashboard each morning to see "New This Week".</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600 mt-1">💡</span>
            <p className="text-gray-700"><strong>Use bookmarks liberally:</strong> Save any opportunity that looks interesting. You can always delete it later from the Saved page.</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600 mt-1">💡</span>
            <p className="text-gray-700"><strong>Set up multiple alerts:</strong> Create separate subscriptions for each NAICS code relevant to your business.</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600 mt-1">💡</span>
            <p className="text-gray-700"><strong>Watch "Expiring Soon":</strong> The dashboard highlights contracts with deadlines within 7 days. Don't miss time-sensitive opportunities!</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600 mt-1">💡</span>
            <p className="text-gray-700"><strong>Use AI Summary first:</strong> Before reading the full solicitation, check the AI Summary to quickly understand requirements and decide if it's worth pursuing.</p>
          </li>
        </ul>
      </div>
    </div>
  );
}
