import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthForms from '../components/Auth/AuthForms'
import { Opportunity } from '../types/opportunity'

// Mock data that looks like real SAM.gov opportunities
const mockOpportunities = [
  {
    noticeId: "54bb4891dbcb45deaf93534930aef2d2",
    title: "Artillery, Chemical Training (ACT)",
    solicitationNumber: "W900KK26R0011",
    department: "DEPT OF DEFENSE.DEPT OF THE ARMY",
    postedDate: "2026-01-25",
    responseDeadline: "2026-02-15",
    naicsCode: "541330",
    description: "Engineering services for military training systems"
  },
  {
    noticeId: "abc123def456ghi789",
    title: "IT Infrastructure Modernization", 
    solicitationNumber: "GSA789456123",
    department: "GENERAL SERVICES ADMINISTRATION",
    postedDate: "2026-01-24",
    responseDeadline: "2026-02-28",
    naicsCode: "541511",
    description: "Custom computer programming services for federal agencies"
  },
  {
    noticeId: "xyz789abc123def456",
    title: "Environmental Assessment Services",
    solicitationNumber: "EPA2026001", 
    department: "ENVIRONMENTAL PROTECTION AGENCY",
    postedDate: "2026-01-23",
    responseDeadline: "2026-03-15",
    naicsCode: "541620",
    description: "Environmental consulting services for remediation projects"
  },
  {
    noticeId: "fed456def789abc123",
    title: "Cybersecurity Assessment and Testing",
    solicitationNumber: "DHS2026SEC001",
    department: "DEPT OF HOMELAND SECURITY", 
    postedDate: "2026-01-22",
    responseDeadline: "2026-02-20",
    naicsCode: "541512",
    description: "Information security services for critical infrastructure"
  },
  {
    noticeId: "gov123abc456def789",
    title: "Medical Equipment Maintenance",
    solicitationNumber: "VA2026MED015",
    department: "DEPT OF VETERANS AFFAIRS",
    postedDate: "2026-01-21", 
    responseDeadline: "2026-03-01",
    naicsCode: "811219",
    description: "Maintenance and repair of medical diagnostic equipment"
  },
  {
    noticeId: "tech567890abc123def",
    title: "Computer Systems Design and Integration",
    solicitationNumber: "NASA2026IT008",
    department: "NATIONAL AERONAUTICS AND SPACE ADMINISTRATION",
    postedDate: "2026-01-20",
    responseDeadline: "2026-03-10",
    naicsCode: "541512",
    description: "Design and implementation of mission-critical computer systems"
  },
  {
    noticeId: "mgmt789012def456ghi",
    title: "Management Consulting Services",
    solicitationNumber: "DOE2026MGT003",
    department: "DEPT OF ENERGY",
    postedDate: "2026-01-19",
    responseDeadline: "2026-02-25",
    naicsCode: "541611",
    description: "Strategic planning and organizational improvement consulting"
  },
  {
    noticeId: "eng345678hij789klm",
    title: "Infrastructure Engineering Analysis",
    solicitationNumber: "DOT2026ENG012",
    department: "DEPT OF TRANSPORTATION",
    postedDate: "2026-01-18",
    responseDeadline: "2026-03-05",
    naicsCode: "541330",
    description: "Civil engineering services for highway infrastructure projects"
  }
];

export default function PersonalizedSearchPage() {
  const { user, profile, signOut, loading: authLoading } = useAuth()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(false)
  const [showAll, setShowAll] = useState(false)

  // Filter opportunities based on user's NAICS codes
  useEffect(() => {
    if (profile?.naics_codes && opportunities.length > 0) {
      const filtered = opportunities.filter((opp: any) => 
        profile.naics_codes.includes(opp.naicsCode)
      )
      setFilteredOpportunities(filtered)
    }
  }, [profile, opportunities])

  const loadOpportunities = async (useRealAPI = false) => {
    setLoading(true)
    
    try {
      if (useRealAPI) {
        // Try real API
        const response = await fetch('http://localhost:3001/api/search/recent')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        console.log('Real API Response:', result)
        
        if (result.data && result.data.opportunitiesData) {
          setOpportunities(result.data.opportunitiesData.slice(0, 20))
        }
      } else {
        // Use mock data
        await new Promise(resolve => setTimeout(resolve, 1000))
        setOpportunities(mockOpportunities)
      }
    } catch (err: any) {
      console.error('API error:', err)
      alert(`API Error: ${err.message}\n\nFalling back to demo data...`)
      setOpportunities(mockOpportunities)
    } finally {
      setLoading(false)
    }
  }

  const saveOpportunity = async (opp: any) => {
    // This would save to Supabase in a real implementation
    alert(`💾 Opportunity "${opp.title}" saved to your account!`)
  }

  if (authLoading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Loading...</h2>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8f9fa', 
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ color: '#333', marginBottom: '10px' }}>
              🎯 SAM.gov Opportunities Platform
            </h1>
            <p style={{ color: '#666', fontSize: '18px' }}>
              Get personalized government contracting opportunities for your industry
            </p>
          </div>
          <AuthForms />
        </div>
      </div>
    )
  }

  const displayOpportunities = showAll ? opportunities : filteredOpportunities
  const hasPersonalizedOpportunities = filteredOpportunities.length > 0

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ color: '#333', marginBottom: '5px' }}>
            👋 Welcome back, {profile?.company_name || user.email}!
          </h1>
          <p style={{ color: '#666', margin: '0', fontSize: '14px' }}>
            Tracking opportunities in: {profile?.naics_codes?.join(', ') || 'No industries selected'}
          </p>
        </div>
        <button
          onClick={signOut}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => loadOpportunities(false)}
          disabled={loading}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Loading...' : '✅ Load Demo Opportunities'}
        </button>

        <button 
          onClick={() => loadOpportunities(true)}
          disabled={loading}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : '🚨 Test Real API'}
        </button>

        {opportunities.length > 0 && (
          <button
            onClick={() => setShowAll(!showAll)}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: showAll ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {showAll ? '🎯 Show My Industries Only' : '📋 Show All Opportunities'}
          </button>
        )}
      </div>

      {/* Results */}
      {opportunities.length > 0 && (
        <div>
          <div style={{ 
            backgroundColor: hasPersonalizedOpportunities ? '#d4edda' : '#fff3cd',
            border: `1px solid ${hasPersonalizedOpportunities ? '#c3e6cb' : '#ffeaa7'}`,
            borderRadius: '6px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <h2 style={{ 
              color: hasPersonalizedOpportunities ? '#155724' : '#856404', 
              margin: '0 0 10px 0' 
            }}>
              {showAll 
                ? `📋 Showing All ${opportunities.length} Opportunities`
                : hasPersonalizedOpportunities
                  ? `🎯 Found ${filteredOpportunities.length} Opportunities for Your Industries`
                  : `⚠️ No opportunities found for your selected NAICS codes`
              }
            </h2>
            <p style={{ 
              color: hasPersonalizedOpportunities ? '#155724' : '#856404', 
              margin: '0', 
              fontSize: '14px' 
            }}>
              {showAll
                ? 'Viewing all available opportunities from SAM.gov'
                : hasPersonalizedOpportunities
                  ? 'These opportunities match your selected industry codes'
                  : 'Try selecting "Show All" or update your industry preferences'
              }
            </p>
          </div>

          <div style={{ display: 'grid', gap: '15px' }}>
            {displayOpportunities.map((opp: any, index: number) => (
              <div key={index} style={{ 
                border: profile?.naics_codes?.includes(opp.naicsCode) ? '2px solid #28a745' : '1px solid #e0e0e0',
                padding: '20px', 
                borderRadius: '8px',
                backgroundColor: 'white',
                boxShadow: profile?.naics_codes?.includes(opp.naicsCode) 
                  ? '0 4px 8px rgba(40, 167, 69, 0.2)' 
                  : '0 2px 4px rgba(0,0,0,0.1)',
                position: 'relative'
              }}>
                {profile?.naics_codes?.includes(opp.naicsCode) && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    🎯 MATCH
                  </div>
                )}

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start', 
                  marginBottom: '15px',
                  marginRight: '60px'
                }}>
                  <h3 style={{ 
                    margin: '0', 
                    color: '#2c3e50', 
                    fontSize: '18px',
                    lineHeight: '1.3',
                    flex: '1'
                  }}>
                    {opp.title || 'No Title'}
                  </h3>
                  <div style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginLeft: '15px'
                  }}>
                    {opp.naicsCode || opp.naicsCodes?.[0]}
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <p style={{ margin: '0 0 5px 0' }}>
                      <strong>📋 Solicitation:</strong> {opp.solicitationNumber || 'N/A'}
                    </p>
                    <p style={{ margin: '0 0 5px 0' }}>
                      <strong>🏛️ Department:</strong> {opp.department || opp.fullParentPathName?.split('.').pop() || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 5px 0' }}>
                      <strong>📅 Posted:</strong> {opp.postedDate || 'N/A'}
                    </p>
                    <p style={{ margin: '0 0 5px 0' }}>
                      <strong>⏰ Deadline:</strong> {opp.responseDeadline || opp.responseDeadLine || 'N/A'}
                    </p>
                  </div>
                </div>

                {opp.description && (
                  <div style={{ 
                    backgroundColor: '#f8f9fa',
                    padding: '12px',
                    borderRadius: '4px',
                    marginTop: '10px'
                  }}>
                    <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                      <strong>Description:</strong> {
                        typeof opp.description === 'string' && opp.description.startsWith('http')
                          ? 'View full description on SAM.gov'
                          : opp.description
                      }
                    </p>
                  </div>
                )}

                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => saveOpportunity(opp)}
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    💾 Save Opportunity
                  </button>
                  <button 
                    onClick={() => window.open(opp.uiLink || `https://sam.gov/opp/${opp.noticeId}`, '_blank')}
                    style={{
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    🔗 View on SAM.gov
                  </button>
                  <button style={{
                    backgroundColor: '#ffc107',
                    color: '#212529',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
                    🤖 AI Analysis
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {opportunities.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '50px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ color: '#666' }}>Ready to find government opportunities?</h3>
          <p style={{ color: '#888' }}>Click "Load Demo Opportunities" or "Test Real API" to get started!</p>
        </div>
      )}
    </div>
  )
}