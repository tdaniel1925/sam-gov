import { useState } from 'react';

export default function SimpleSearchPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchOpportunities = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:3001/api/search/recent');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.data && result.data.opportunitiesData) {
        setOpportunities(result.data.opportunitiesData.slice(0, 10)); // Show first 10
      } else {
        setError('No opportunities found');
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>SAM.gov Search Test</h1>
      
      <button 
        onClick={searchOpportunities}
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Loading...' : 'Load Recent Opportunities'}
      </button>

      {error && (
        <div style={{ color: 'red', margin: '20px 0' }}>
          Error: {error}
        </div>
      )}

      {opportunities.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>Found {opportunities.length} Opportunities</h2>
          {opportunities.map((opp: any, index: number) => (
            <div key={index} style={{ 
              border: '1px solid #ddd', 
              padding: '15px', 
              margin: '10px 0',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                {opp.title || 'No Title'}
              </h3>
              <p><strong>Notice ID:</strong> {opp.noticeId || 'N/A'}</p>
              <p><strong>Department:</strong> {opp.department || 'N/A'}</p>
              <p><strong>Posted:</strong> {opp.postedDate || 'N/A'}</p>
              <p><strong>Deadline:</strong> {opp.responseDeadline || 'N/A'}</p>
              {opp.solicitationNumber && (
                <p><strong>Solicitation:</strong> {opp.solicitationNumber}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}