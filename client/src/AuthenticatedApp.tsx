import { AuthProvider } from './contexts/AuthContext'
import PersonalizedSearchPage from './pages/PersonalizedSearchPage'

function AuthenticatedApp() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <PersonalizedSearchPage />
      </div>
    </AuthProvider>
  )
}

export default AuthenticatedApp