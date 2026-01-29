import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { user, profile } = useAuth()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Profile</h1>
        <p className="mt-2 text-sm text-gray-600">
          View your account information
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white shadow-sm rounded-lg p-6 space-y-6">
        {/* Account Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{user?.email || 'Not available'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">User ID</label>
              <p className="mt-1 text-sm text-gray-600 font-mono">{user?.id || 'Not available'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Created</label>
              <p className="mt-1 text-sm text-gray-900">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Not available'}
              </p>
            </div>
          </div>
        </div>

        {/* Company Profile */}
        {profile && (
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Profile</h2>
            <div className="space-y-3">
              {profile.company_name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.company_name}</p>
                </div>
              )}
              {profile.naics_codes && profile.naics_codes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">NAICS Codes</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.naics_codes.map((code: string) => (
                      <span
                        key={code}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Message */}
        <div className="border-t pt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Profile features are coming soon! You'll be able to manage your company information, certifications, and preferences.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
