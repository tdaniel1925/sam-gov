import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../UI/Button'

// Common NAICS codes for professional selection
const NAICS_CATEGORIES = [
  {
    category: 'Technology & Engineering',
    codes: [
      { code: '541330', name: 'Engineering Services' },
      { code: '541511', name: 'Custom Computer Programming' },
      { code: '541512', name: 'Computer Systems Design' },
      { code: '541513', name: 'Computer Facilities Management' },
      { code: '541519', name: 'Other Computer Related Services' }
    ]
  },
  {
    category: 'Consulting & Management',
    codes: [
      { code: '541611', name: 'Administrative Management Consulting' },
      { code: '541612', name: 'Human Resources Consulting' },
      { code: '541613', name: 'Marketing Consulting' },
      { code: '541618', name: 'Other Management Consulting' },
      { code: '541620', name: 'Environmental Consulting' },
      { code: '541690', name: 'Other Scientific/Technical Consulting' }
    ]
  },
  {
    category: 'Support & Maintenance',
    codes: [
      { code: '561210', name: 'Facilities Support Services' },
      { code: '561990', name: 'All Other Support Services' },
      { code: '811219', name: 'Electronic Equipment Repair' }
    ]
  },
  {
    category: 'Manufacturing & Hardware',
    codes: [
      { code: '334111', name: 'Electronic Computer Manufacturing' },
      { code: '423430', name: 'Computer Equipment Wholesale' }
    ]
  }
]

export default function ProfessionalAuth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [selectedNaics, setSelectedNaics] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const { signIn, signUp } = useAuth()

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) {
          showMessage(`Login failed: ${error.message}`, 'error')
        } else {
          showMessage('Welcome back!', 'success')
        }
      } else {
        if (selectedNaics.length === 0) {
          showMessage('Please select at least one industry to receive relevant opportunities', 'error')
          setLoading(false)
          return
        }

        const { error } = await signUp(email, password, companyName, selectedNaics)
        if (error) {
          showMessage(`Account creation failed: ${error.message}`, 'error')
        } else {
          showMessage('Account created successfully! Please check your email to confirm your account.', 'success')
        }
      }
    } catch (error: any) {
      showMessage(`Unexpected error: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const toggleNaicsCode = (code: string) => {
    setSelectedNaics(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-2 text-xl font-bold text-gray-900">OpportunityTracker</span>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Government Contracting Intelligence
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h1>
            <p className="text-gray-600">
              {isLogin 
                ? 'Access your personalized government contracting opportunities'
                : 'Join thousands of contractors finding government opportunities'
              }
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>

              {/* Company Name (Sign up only) */}
              {!isLogin && (
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name (Optional)
                  </label>
                  <input
                    id="company"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your company name"
                  />
                </div>
              )}

              {/* Industry Selection (Sign up only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Your Industries
                  </label>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                    {NAICS_CATEGORIES.map((category) => (
                      <div key={category.category} className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2 text-sm">
                          {category.category}
                        </h4>
                        <div className="space-y-2">
                          {category.codes.map((naics) => (
                            <label key={naics.code} className="flex items-start space-x-2 text-sm">
                              <input
                                type="checkbox"
                                checked={selectedNaics.includes(naics.code)}
                                onChange={() => toggleNaicsCode(naics.code)}
                                className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-gray-700">
                                <span className="font-mono text-blue-600">{naics.code}</span> - {naics.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedNaics.length > 0 && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ {selectedNaics.length} industries selected
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            {/* Message */}
            {message && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                messageType === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {message}
              </div>
            )}

            {/* Toggle Form */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setMessage('')
                }}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                {isLogin 
                  ? "Don't have an account? Create one" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 text-center">
            <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-1">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <span>Automated Alerts</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-1">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
                <span>Industry Focused</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-1">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
                  </svg>
                </div>
                <span>Real-time Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}