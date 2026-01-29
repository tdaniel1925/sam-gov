// =============================================================================
// MAIN APP COMPONENT
// Following CodeBakers pattern 04-frontend.md + 02-auth.md
// Complete routing with authentication, protected routes, and SaaS pages
// =============================================================================

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPageAuth';
import SubscriptionPage from './pages/SubscriptionPage';
import SearchPage from './pages/SearchPage';
import SavedPage from './pages/SavedPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import AdvancedSearchPage from './pages/AdvancedSearchPage';
import OpportunityDetailPage from './pages/OpportunityDetailPage';
import ProposalGeneratorPage from './pages/ProposalGeneratorPage';
import SimpleApp from './SimpleApp';

// =============================================================================
// PROTECTED ROUTE COMPONENT
// Redirects to login if user is not authenticated
// =============================================================================
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// =============================================================================
// PUBLIC ROUTE COMPONENT
// Redirects to dashboard if user is already authenticated
// =============================================================================
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  // Check if we're in demo mode or if backend is not available
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
  const isBackendAvailable = import.meta.env.VITE_BACKEND_AVAILABLE !== 'false';

  // If demo mode or no backend, show simple app
  if (isDemoMode || !isBackendAvailable) {
    return <SimpleApp />;
  }

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" richColors />

          <Routes>
            {/* Public Routes - redirect to dashboard if already logged in */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              }
            />

            {/* Protected Routes - require authentication */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscription"
              element={
                <ProtectedRoute>
                  <SubscriptionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <SearchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saved"
              element={
                <ProtectedRoute>
                  <SavedPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/advanced-search"
              element={
                <ProtectedRoute>
                  <AdvancedSearchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/opportunity-detail"
              element={
                <ProtectedRoute>
                  <OpportunityDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proposal-generator"
              element={
                <ProtectedRoute>
                  <ProposalGeneratorPage />
                </ProtectedRoute>
              }
            />

            {/* Public Search Route - for testing */}
            <Route path="/public-search" element={<SearchPage />} />

            {/* Default route - redirect to dashboard */}
            <Route path="/" element={<Navigate to="/public-search" replace />} />

            {/* 404 - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

