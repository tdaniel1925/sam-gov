import { API_URL } from "../config/api";
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/UI/Button'

interface SearchAlert {
  id: string
  name: string
  naics_codes: string[]
  frequency: 'daily' | 'weekly' | 'monthly'
  enabled: boolean
  last_sent?: string
  opportunities_found?: number
}

export default function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<'opportunities' | 'alerts' | 'profile'>('opportunities')
  const [opportunities, setOpportunities] = useState([])
  const [alerts, setAlerts] = useState<SearchAlert[]>([])
  const [loading, setLoading] = useState(false)
  const [newAlertForm, setNewAlertForm] = useState({
    name: '',
    naics_codes: [] as string[],
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly'
  })

  // Load data on mount
  useEffect(() => {
    loadOpportunities()
    loadAlerts()
  }, [])

  const loadOpportunities = async () => {
    setLoading(true)
    try {
      // This would call your real API
      const response = await fetch(API_URL + '/search/recent')
      if (response.ok) {
        const result = await response.json()
        if (result.data?.opportunitiesData) {
          // Filter by user's NAICS codes
          const filtered = result.data.opportunitiesData.filter((opp: any) =>
            profile?.naics_codes?.some(code => 
              opp.naicsCode === code || opp.naicsCodes?.includes(code)
            )
          )
          setOpportunities(filtered.slice(0, 20))
        }
      }
    } catch (error) {
      console.error('Error loading opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAlerts = async () => {
    try {
      const response = await fetch(API_URL + '/alerts')
      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          setAlerts(result.data)
        }
      }
    } catch (error) {
      console.error('Error loading alerts:', error)
    }
  }

  const createAlert = async () => {
    if (!newAlertForm.name || newAlertForm.naics_codes.length === 0) return

    try {
      const response = await fetch(API_URL + '/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAlertForm)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          setAlerts([...alerts, result.data])
          setNewAlertForm({ name: '', naics_codes: [], frequency: 'weekly' })
        }
      }
    } catch (error) {
      console.error('Error creating alert:', error)
    }
  }

  const toggleAlert = async (alertId: string) => {
    try {
      const alert = alerts.find(a => a.id === alertId)
      if (!alert) return

      const response = await fetch(`${API_URL}/alerts/${alertId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: !alert.enabled })
      })

      if (response.ok) {
        setAlerts(alerts.map(a =>
          a.id === alertId ? { ...a, enabled: !a.enabled } : a
        ))
      }
    } catch (error) {
      console.error('Error toggling alert:', error)
    }
  }

  const deleteAlert = async (alertId: string) => {
    try {
      const response = await fetch(`${API_URL}/alerts/${alertId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setAlerts(alerts.filter(alert => alert.id !== alertId))
      }
    } catch (error) {
      console.error('Error deleting alert:', error)
    }
  }

  const availableNaicsWithNames = [
    { code: '541330', name: 'Engineering Services' },
    { code: '541511', name: 'Custom Computer Programming' },
    { code: '541512', name: 'Computer Systems Design' },
    { code: '541611', name: 'Management Consulting' },
    { code: '541620', name: 'Environmental Consulting' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">OpportunityTracker</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Welcome back, <span className="font-medium text-gray-900">
                  {profile?.company_name || user?.email}
                </span>
              </div>
              <Button variant="ghost" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'opportunities', name: 'Opportunities', icon: '🎯' },
              { id: 'alerts', name: 'Email Alerts', icon: '📧' },
              { id: 'profile', name: 'Profile', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Opportunities Tab */}
        {activeTab === 'opportunities' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Government Opportunities</h1>
                <p className="text-gray-600">Opportunities matching your selected industries</p>
              </div>
              <Button onClick={loadOpportunities} loading={loading}>
                Refresh Data
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Active Opportunities</h3>
                    <p className="text-2xl font-bold text-blue-600">{opportunities.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"/>
                      <path d="M3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Industries Tracked</h3>
                    <p className="text-2xl font-bold text-green-600">{profile?.naics_codes?.length || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"/>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Email Alerts</h3>
                    <p className="text-2xl font-bold text-yellow-600">{alerts.filter(a => a.enabled).length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Opportunities List */}
            {opportunities.length > 0 ? (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Opportunities</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {opportunities.slice(0, 10).map((opp: any, index) => (
                    <div key={index} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {opp.title}
                          </h3>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <span className="font-medium">Solicitation:</span> {opp.solicitationNumber}
                            </div>
                            <div>
                              <span className="font-medium">NAICS:</span> {opp.naicsCode || opp.naicsCodes?.[0]}
                            </div>
                            <div>
                              <span className="font-medium">Posted:</span> {opp.postedDate}
                            </div>
                            <div>
                              <span className="font-medium">Deadline:</span> {opp.responseDeadLine || 'Not specified'}
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm">
                            {opp.fullParentPathName?.split('.').slice(-2).join(' - ')}
                          </p>
                        </div>
                        <div className="ml-6 flex items-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {opp.naicsCode || opp.naicsCodes?.[0]}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(opp.uiLink || `https://sam.gov`, '_blank')}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
                <p className="text-gray-600 mb-4">We haven't found any recent opportunities matching your selected industries.</p>
                <Button onClick={loadOpportunities} loading={loading}>
                  Check for New Opportunities
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Email Alerts Tab */}
        {activeTab === 'alerts' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Email Alert Management</h1>
              <p className="text-gray-600">Set up automated emails for new opportunities in your industries</p>
            </div>

            {/* Create New Alert Form */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Alert</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alert Name</label>
                  <input
                    type="text"
                    value={newAlertForm.name}
                    onChange={(e) => setNewAlertForm({...newAlertForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., IT Services Alert"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industries</label>
                  <select
                    multiple
                    value={newAlertForm.naics_codes}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value)
                      setNewAlertForm({...newAlertForm, naics_codes: selected})
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {availableNaicsWithNames.map(naics => (
                      <option key={naics.code} value={naics.code}>
                        {naics.code} - {naics.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select
                    value={newAlertForm.frequency}
                    onChange={(e) => setNewAlertForm({...newAlertForm, frequency: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              
              <Button onClick={createAlert} disabled={!newAlertForm.name || newAlertForm.naics_codes.length === 0}>
                Create Alert
              </Button>
            </div>

            {/* Active Alerts */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Your Email Alerts</h2>
              </div>
              
              {alerts.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{alert.name}</h3>
                            <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              alert.enabled 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {alert.enabled ? 'Active' : 'Paused'}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>
                              <span className="font-medium">Industries:</span> {alert.naics_codes.join(', ')}
                            </div>
                            <div>
                              <span className="font-medium">Frequency:</span> {alert.frequency}
                            </div>
                            {alert.last_sent && (
                              <div>
                                <span className="font-medium">Last sent:</span> {alert.last_sent}
                                {alert.opportunities_found && (
                                  <span className="text-green-600"> ({alert.opportunities_found} opportunities found)</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant={alert.enabled ? 'secondary' : 'primary'}
                            onClick={() => toggleAlert(alert.id)}
                          >
                            {alert.enabled ? 'Pause' : 'Resume'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteAlert(alert.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts configured</h3>
                  <p className="text-gray-600">Create your first email alert to get notified of new opportunities.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600">Manage your account and industry preferences</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={profile?.company_name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your company name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tracked Industries</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile?.naics_codes?.map(code => (
                      <span key={code} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        {code}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Contact support to modify your tracked industries
                  </p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button variant="primary">
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}