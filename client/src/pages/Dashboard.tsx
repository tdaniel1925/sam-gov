import { useState, useEffect } from 'react'
import { API_URL } from '../config/api'

export default function Dashboard() {
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Government Contract Opportunities
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
