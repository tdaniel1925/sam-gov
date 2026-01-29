import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/advanced-search', label: 'Advanced Search' },
    { path: '/proposals', label: 'Proposals' },
    { path: '/saved-searches', label: 'Saved Searches' },
    { path: '/win-rate', label: 'Win Rate' },
    { path: '/saved', label: 'Saved' },
    { path: '/notifications', label: 'Notifications' },
    { path: '/coming-soon', label: 'Coming Soon' },
    { path: '/help', label: 'Help' },
    { path: '/profile', label: 'Profile' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          {/* Top bar */}
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"/>
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">SAM.gov Opportunities</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {profile?.company_name || user?.email || 'User'}
              </span>
              <button
                onClick={signOut}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex space-x-1 border-t pt-2 pb-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* MVP Footer Notice */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              <strong>MVP Demo:</strong> Some features (email notifications, proposals) not yet functional.
              <button
                onClick={() => navigate('/coming-soon')}
                className="text-indigo-600 hover:text-indigo-700 font-medium ml-1 underline"
              >
                View roadmap →
              </button>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
