import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProfessionalAuth from './components/Auth/ProfessionalAuth'
import AppLayout from './components/Layout/AppLayout'
import Dashboard from './pages/Dashboard'
import AdvancedSearchPage from './pages/AdvancedSearchPage'
import SavedPage from './pages/SavedPage'
import NotificationsPage from './pages/NotificationsPage'
import HelpPage from './pages/HelpPage'
import ProfilePage from './pages/ProfilePage'
import OpportunityDetailPage from './pages/OpportunityDetailPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <ProfessionalAuth />
  }

  return <AppLayout>{children}</AppLayout>
}

function ProfessionalApp() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/advanced-search" element={<ProtectedRoute><AdvancedSearchPage /></ProtectedRoute>} />
          <Route path="/opportunity/:id" element={<ProtectedRoute><OpportunityDetailPage /></ProtectedRoute>} />
          <Route path="/saved" element={<ProtectedRoute><SavedPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default ProfessionalApp