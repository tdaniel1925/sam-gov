import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { API_URL } from '../config/api'
import { savedAPI, SavedOpportunity } from '../lib/api/saved'
import { toast } from 'sonner'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [savedOpportunities, setSavedOpportunities] = useState<SavedOpportunity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadOpportunities()
    loadSavedOpportunities()
  }, [])

  const loadSavedOpportunities = async () => {
    try {
      const saved = await savedAPI.getAll()
      setSavedOpportunities(saved)
    } catch (err) {
      console.error('Error loading saved opportunities:', err)
    }
  }

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

  const isSaved = (noticeId: string) => {
    return savedOpportunities.some(saved => saved.noticeId === noticeId)
  }

  const handleSave = async (opp: any) => {
    if (savingIds.has(opp.noticeId)) return

    setSavingIds(prev => new Set(prev).add(opp.noticeId))
    try {
      await savedAPI.save(opp)
      await loadSavedOpportunities()
      toast.success('Opportunity saved!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save opportunity')
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev)
        next.delete(opp.noticeId)
        return next
      })
    }
  }

  const handleUnsave = async (noticeId: string) => {
    if (savingIds.has(noticeId)) return

    const saved = savedOpportunities.find(s => s.noticeId === noticeId)
    if (!saved) return

    setSavingIds(prev => new Set(prev).add(noticeId))
    try {
      await savedAPI.delete(saved.id)
      await loadSavedOpportunities()
      toast.success('Opportunity removed from saved')
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove opportunity')
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev)
        next.delete(noticeId)
        return next
      })
    }
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

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => navigate('/advanced-search')}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg p-6 text-left transition-all transform hover:scale-105 shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2">Advanced Search</h3>
          <p className="text-blue-100 text-sm">15+ filters, AI-powered matching, save searches</p>
        </button>

        <button
          onClick={() => navigate('/saved')}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg p-6 text-left transition-all transform hover:scale-105 shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2">Saved Opportunities</h3>
          <p className="text-purple-100 text-sm">{savedOpportunities.length} bookmarked contracts with notes</p>
        </button>

        <button
          onClick={() => navigate('/notifications')}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg p-6 text-left transition-all transform hover:scale-105 shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2">Email Alerts</h3>
          <p className="text-green-100 text-sm">Get notified of new opportunities</p>
        </button>
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

      {/* Analytics Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Opportunities */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Available</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{opportunities.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Active contracts</p>
        </div>

        {/* New This Week */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New This Week</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {opportunities.filter(opp => {
                  if (!opp.postedDate) return false;
                  const posted = new Date(opp.postedDate);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return posted >= weekAgo;
                }).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Posted in last 7 days</p>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {opportunities.filter(opp => {
                  if (!opp.responseDeadLine) return false;
                  const deadline = new Date(opp.responseDeadLine);
                  const now = new Date();
                  const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  return daysUntil > 0 && daysUntil <= 7;
                }).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Deadline within 7 days</p>
        </div>

        {/* Saved */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saved</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{savedOpportunities.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Bookmarked opportunities</p>
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
                  <div className="ml-4 flex gap-2">
                    {/* Bookmark Button */}
                    <button
                      onClick={() => isSaved(opp.noticeId) ? handleUnsave(opp.noticeId) : handleSave(opp)}
                      disabled={savingIds.has(opp.noticeId)}
                      className={`px-3 py-2 text-sm rounded transition-colors ${
                        isSaved(opp.noticeId)
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:opacity-50`}
                      title={isSaved(opp.noticeId) ? 'Remove from saved' : 'Save opportunity'}
                    >
                      <svg className="w-5 h-5" fill={isSaved(opp.noticeId) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>

                    {/* View Details Button - Navigate to internal detail page */}
                    <button
                      onClick={() => navigate(`/opportunity/${opp.noticeId}`, { state: { opportunity: opp } })}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      View Details
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
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
