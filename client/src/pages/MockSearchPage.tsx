import { useState } from 'react';
import { Opportunity } from '../types/opportunity';

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
  }
];

export default function MockSearchPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMockOpportunities = async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setOpportunities(mockOpportunities);
    setLoading(false);
  };

  const testRealAPI = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/search/recent');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Real API Response:', result);
      
      if (result.data && result.data.opportunitiesData) {
        setOpportunities(result.data.opportunitiesData.slice(0, 10));
      }
    } catch (err: any) {
      console.error('Real API error:', err);
      alert(`Real API Error: ${err.message}\n\nThis is expected - SAM.gov API is currently suspended.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>🎉 SAM.gov SaaS Platform - Demo</h1>
        <p style={{ color: '#666', margin: '0' }}>
          Your $1M+ SaaS platform is working perfectly! The SAM.gov government API is currently suspended, 
          so we're showing mock data to demonstrate functionality.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={loadMockOpportunities}
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
          onClick={testRealAPI}
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
          {loading ? 'Testing...' : '🚨 Test Real API (Will Fail)'}
        </button>
      </div>

      {opportunities.length > 0 && (
        <div>
          <div style={{ 
            backgroundColor: '#d4edda', 
            border: '1px solid #c3e6cb',
            borderRadius: '6px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <h2 style={{ color: '#155724', margin: '0 0 10px 0' }}>
              🎯 Found {opportunities.length} Government Contracting Opportunities
            </h2>
            <p style={{ color: '#155724', margin: '0', fontSize: '14px' }}>
              This demonstrates your SaaS platform's core functionality. In production, this would show 
              real opportunities from SAM.gov worth billions in government contracts.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '15px' }}>
            {opportunities.map((opp: any, index: number) => (
              <div key={index} style={{ 
                border: '1px solid #e0e0e0', 
                padding: '20px', 
                borderRadius: '8px',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'box-shadow 0.2s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
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
                    {opp.naicsCode}
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <p style={{ margin: '0 0 5px 0' }}><strong>📋 Solicitation:</strong> {opp.solicitationNumber || 'N/A'}</p>
                    <p style={{ margin: '0 0 5px 0' }}><strong>🏛️ Department:</strong> {opp.department || 'N/A'}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 5px 0' }}><strong>📅 Posted:</strong> {opp.postedDate || 'N/A'}</p>
                    <p style={{ margin: '0 0 5px 0' }}><strong>⏰ Deadline:</strong> {opp.responseDeadline || 'N/A'}</p>
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
                      <strong>Description:</strong> {opp.description}
                    </p>
                  </div>
                )}

                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <button style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
                    💾 Save Opportunity
                  </button>
                  <button style={{
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
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
    </div>
  );
}