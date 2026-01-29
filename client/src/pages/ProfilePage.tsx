import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import { apiKeysAPI, ApiKey } from '../lib/apiKeys'
import { Key, Loader2, Eye, EyeOff, Trash2, Check, AlertCircle } from 'lucide-react'

export default function ProfilePage() {
  const { user, profile, tierStatus, refreshTierStatus } = useAuth()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form states for new keys
  const [samApiKey, setSamApiKey] = useState('')
  const [openaiApiKey, setOpenaiApiKey] = useState('')
  const [showSamKey, setShowSamKey] = useState(false)
  const [showOpenAIKey, setShowOpenAIKey] = useState(false)

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    try {
      setLoading(true)
      const keys = await apiKeysAPI.getKeys()
      setApiKeys(keys)
    } catch (error) {
      console.error('Error loading API keys:', error)
      toast.error('Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSamKey = async () => {
    if (!samApiKey.trim()) {
      toast.error('Please enter a SAM.gov API key')
      return
    }

    try {
      setSaving(true)
      await apiKeysAPI.saveKey('sam_gov', samApiKey)
      toast.success('SAM.gov API key saved successfully')
      setSamApiKey('')
      await loadApiKeys()
      await refreshTierStatus()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save SAM.gov API key')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveOpenAIKey = async () => {
    if (!openaiApiKey.trim()) {
      toast.error('Please enter an OpenAI API key')
      return
    }

    try {
      setSaving(true)
      await apiKeysAPI.saveKey('openai', openaiApiKey)
      toast.success('OpenAI API key saved successfully')
      setOpenaiApiKey('')
      await loadApiKeys()
      await refreshTierStatus()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save OpenAI API key')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) {
      return
    }

    try {
      await apiKeysAPI.deleteKey(keyId)
      toast.success('API key deleted')
      await loadApiKeys()
      await refreshTierStatus()
    } catch (error) {
      toast.error('Failed to delete API key')
    }
  }

  const samKey = apiKeys.find(k => k.provider === 'sam_gov')
  const openaiKey = apiKeys.find(k => k.provider === 'openai')

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Profile</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your account settings, API keys, and subscription
        </p>
      </div>

      {/* Tier Status Banner */}
      {tierStatus && (
        <div className={`mb-6 rounded-lg p-4 ${
          tierStatus.isPaidTier
            ? 'bg-green-50 border border-green-200'
            : 'bg-amber-50 border border-amber-200'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                {tierStatus.isPaidTier ? '✨ Full Access' : '🆓 Free Trial'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {tierStatus.isPaidTier
                  ? 'You have unlimited access to all features'
                  : `${tierStatus.rateLimit.remaining} of ${tierStatus.rateLimit.limit} daily searches remaining`
                }
              </p>
            </div>
            {!tierStatus.isPaidTier && (
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm">
                Upgrade to Paid
              </button>
            )}
          </div>
        </div>
      )}

      {/* API Keys Section */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Key className="text-blue-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">API Keys</h2>
        </div>

        {tierStatus && !tierStatus.isPaidTier && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-semibold text-blue-900">Upgrade Required for Full Features</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Free tier users can test the platform with our API keys (limited to 1 search/day).
                  Add your own API keys to unlock unlimited searches and AI features.
                </p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* SAM.gov API Key */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">SAM.gov API Key</h3>

              {samKey ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-3">
                      <Check className="text-green-600" size={20} />
                      <div>
                        <p className="font-mono text-sm text-gray-900">{samKey.maskedKey}</p>
                        <p className="text-xs text-gray-500">Added {new Date(samKey.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteKey(samKey.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    ✓ Your SAM.gov API key is configured. You can search government opportunities.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type={showSamKey ? 'text' : 'password'}
                      value={samApiKey}
                      onChange={(e) => setSamApiKey(e.target.value)}
                      placeholder="Enter your SAM.gov API key"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSamKey(!showSamKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showSamKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <button
                    onClick={handleSaveSamKey}
                    disabled={saving || !samApiKey.trim()}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save SAM.gov API Key'}
                  </button>
                  <div className="text-xs text-gray-600">
                    <p className="font-semibold mb-1">How to get your SAM.gov API key:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Visit <a href="https://open.gsa.gov/api/sam-entity-api/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">SAM.gov API</a></li>
                      <li>Create a free account</li>
                      <li>Generate an API key from your dashboard</li>
                      <li>Paste it here</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* OpenAI API Key */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">OpenAI API Key (for AI Features)</h3>

              {openaiKey ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-3">
                      <Check className="text-green-600" size={20} />
                      <div>
                        <p className="font-mono text-sm text-gray-900">{openaiKey.maskedKey}</p>
                        <p className="text-xs text-gray-500">Added {new Date(openaiKey.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteKey(openaiKey.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    ✓ Your OpenAI API key is configured. AI features (summaries, scoring, proposals) are enabled.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type={showOpenAIKey ? 'text' : 'password'}
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-md pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showOpenAIKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <button
                    onClick={handleSaveOpenAIKey}
                    disabled={saving || !openaiApiKey.trim()}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save OpenAI API Key'}
                  </button>
                  <div className="text-xs text-gray-600">
                    <p className="font-semibold mb-1">How to get your OpenAI API key:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a></li>
                      <li>Create an account or sign in</li>
                      <li>Go to API Keys section</li>
                      <li>Create a new secret key</li>
                      <li>Paste it here (starts with "sk-")</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Account Information */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{user?.email || 'Not available'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Created</label>
            <p className="mt-1 text-sm text-gray-900">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Not available'}
            </p>
          </div>
          {profile?.company_name && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <p className="mt-1 text-sm text-gray-900">{profile.company_name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
