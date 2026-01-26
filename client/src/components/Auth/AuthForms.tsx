import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

// Common NAICS codes for easy selection
const COMMON_NAICS = [
  { code: '541330', name: 'Engineering Services' },
  { code: '541511', name: 'Custom Computer Programming' },
  { code: '541512', name: 'Computer Systems Design' },
  { code: '541513', name: 'Computer Facilities Management' },
  { code: '541519', name: 'Other Computer Related Services' },
  { code: '541611', name: 'Administrative Management Consulting' },
  { code: '541612', name: 'Human Resources Consulting' },
  { code: '541613', name: 'Marketing Consulting' },
  { code: '541618', name: 'Other Management Consulting' },
  { code: '541620', name: 'Environmental Consulting' },
  { code: '541690', name: 'Other Scientific/Technical Consulting' },
  { code: '561210', name: 'Facilities Support Services' },
  { code: '561990', name: 'All Other Support Services' },
  { code: '334111', name: 'Electronic Computer Manufacturing' },
  { code: '423430', name: 'Computer Equipment Wholesale' },
  { code: '811219', name: 'Other Electronic Equipment Repair' }
]

interface AuthFormsProps {
  onSuccess?: () => void
}

export default function AuthForms({ onSuccess }: AuthFormsProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [selectedNaics, setSelectedNaics] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) {
          setMessage(`Login failed: ${error.message}`)
        } else {
          setMessage('Logged in successfully!')
          onSuccess?.()
        }
      } else {
        if (selectedNaics.length === 0) {
          setMessage('Please select at least one industry (NAICS code)')
          setLoading(false)
          return
        }

        const { error } = await signUp(email, password, companyName, selectedNaics)
        if (error) {
          setMessage(`Sign up failed: ${error.message}`)
        } else {
          setMessage('Account created! Check your email to confirm.')
        }
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
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

  const styles = {
    container: {
      maxWidth: '400px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e0e0e0'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '20px',
      textAlign: 'center' as const,
      color: '#333'
    },
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '15px'
    },
    input: {
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '16px',
      outline: 'none'
    },
    button: {
      padding: '12px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    buttonDisabled: {
      backgroundColor: '#ccc',
      cursor: 'not-allowed'
    },
    toggleButton: {
      background: 'none',
      border: 'none',
      color: '#007bff',
      textDecoration: 'underline',
      cursor: 'pointer',
      fontSize: '14px'
    },
    message: {
      padding: '10px',
      borderRadius: '4px',
      fontSize: '14px',
      textAlign: 'center' as const
    },
    messageError: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb'
    },
    messageSuccess: {
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb'
    },
    naicsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '8px',
      maxHeight: '200px',
      overflowY: 'auto' as const,
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      backgroundColor: '#f8f9fa'
    },
    naicsItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      padding: '4px'
    },
    checkbox: {
      width: '16px',
      height: '16px'
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>
        {isLogin ? '🔐 Login' : '🚀 Create Account'}
      </h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="Company Name (Optional)"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={styles.input}
            />

            <div>
              <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                Select Your Industries (NAICS Codes):
              </label>
              <div style={styles.naicsGrid}>
                {COMMON_NAICS.map((naics) => (
                  <label key={naics.code} style={styles.naicsItem}>
                    <input
                      type="checkbox"
                      checked={selectedNaics.includes(naics.code)}
                      onChange={() => toggleNaicsCode(naics.code)}
                      style={styles.checkbox}
                    />
                    <span>
                      <strong>{naics.code}</strong> - {naics.name}
                    </span>
                  </label>
                ))}
              </div>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Selected: {selectedNaics.length} industries
              </p>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {})
          }}
        >
          {loading 
            ? (isLogin ? 'Logging in...' : 'Creating Account...') 
            : (isLogin ? 'Login' : 'Create Account')
          }
        </button>
      </form>

      {message && (
        <div style={{
          ...styles.message,
          ...(message.includes('failed') || message.includes('Error') 
            ? styles.messageError 
            : styles.messageSuccess)
        }}>
          {message}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin)
            setMessage('')
          }}
          style={styles.toggleButton}
        >
          {isLogin 
            ? "Don't have an account? Sign up" 
            : "Already have an account? Login"
          }
        </button>
      </div>
    </div>
  )
}