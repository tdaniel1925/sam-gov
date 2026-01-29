import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { API_URL } from '../config/api'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    loadOpportunities()
  }, [])

  const loadOpportunities = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/search/recent`)
      const result = await response.json()

      if (result?.data?.opportunitiesData && Array.isArray(result.data.opportunitiesData)) {
        const opps = result.data.opportunitiesData.slice(0, 20)
        console.log(`📊 Loaded ${opps.length} opportunities from API (total: ${result.data.totalRecords})`)
        console.log('First opportunity:', opps[0])
        setOpportunities(opps)
      } else {
        console.error('❌ Invalid API response:', result)
        setOpportunities([])
      }
    } catch (err) {
      console.error('Error loading opportunities:', err)
      setError('Failed to load opportunities')
      setOpportunities([])
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getUserName = () => {
    if (profile?.company_name) return profile.company_name
    if (user?.email) return user.email.split('@')[0]
    return 'there'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, {getUserName()}!
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome to your SAM.gov Opportunities dashboard
        </p>
      </div>

      {/* Introduction Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border border-blue-100">
        <h2 className="text-xl font-bold text-gray-900 mb-3">What is this platform?</h2>
        <p className="text-gray-700 mb-4">
          This platform helps you discover and track federal government contract opportunities from SAM.gov.
          We aggregate thousands of opportunities and make it easy to find contracts that match your business capabilities.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Smart Search</h3>
            <p className="text-sm text-gray-600">Filter opportunities by NAICS code, agency, and set-aside type</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Save & Track</h3>
            <p className="text-sm text-gray-600">Bookmark opportunities and get notified of updates</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Stay Updated</h3>
            <p className="text-sm text-gray-600">Daily updates with the latest contract opportunities</p>
          </div>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="bg-amber-50 rounded-lg p-6 mb-8 border border-amber-200">
        <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
          <svg className="w-6 h-6 text-amber-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Coming Soon
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <span className="text-amber-600 mr-2">•</span>
            <div>
              <h3 className="font-semibold text-gray-900">AI-Powered Matching</h3>
              <p className="text-sm text-gray-600">Automatically score opportunities based on your company profile</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-amber-600 mr-2">•</span>
            <div>
              <h3 className="font-semibold text-gray-900">Proposal Assistant</h3>
              <p className="text-sm text-gray-600">AI-powered proposal generation and compliance matrix tools</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-amber-600 mr-2">•</span>
            <div>
              <h3 className="font-semibold text-gray-900">Email Alerts</h3>
              <p className="text-sm text-gray-600">Get daily digest emails with opportunities matching your criteria</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-amber-600 mr-2">•</span>
            <div>
              <h3 className="font-semibold text-gray-900">Team Collaboration</h3>
              <p className="text-sm text-gray-600">Share opportunities and collaborate with your team members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Latest Opportunities
            </h2>
            <p className="text-gray-600 mt-1">
              {opportunities.length} opportunities available
            </p>
          </div>
            <button
              onClick={loadOpportunities}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Opportunities List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading opportunities...</p>
          </div>
        ) : opportunities.length > 0 ? (
          <div className="space-y-4">
            {opportunities.map((opp, index) => (
              <div key={opp.noticeId || index} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {opp.title || 'Untitled Opportunity'}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                      {opp.solicitationNumber && (
                        <div>
                          <span className="font-medium">Solicitation:</span> {opp.solicitationNumber}
                        </div>
                      )}
                      {opp.naicsCode && (
                        <div>
                          <span className="font-medium">NAICS:</span> {opp.naicsCode}
                        </div>
                      )}
                      {opp.postedDate && (
                        <div>
                          <span className="font-medium">Posted:</span> {opp.postedDate}
                        </div>
                      )}
                      {opp.responseDeadLine && (
                        <div>
                          <span className="font-medium">Deadline:</span> {opp.responseDeadLine}
                        </div>
                      )}
                    </div>
                    {opp.fullParentPathName && (
                      <p className="text-sm text-gray-500">
                        {opp.fullParentPathName}
                      </p>
                    )}
                  </div>
                  {opp.uiLink && (
                    <a
                      href={opp.uiLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
            <p className="text-gray-600 mb-4">Click refresh to load opportunities from SAM.gov</p>
            <button
              onClick={loadOpportunities}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Load Opportunities
            </button>
          </div>
        )}
    </div>
  )
}
